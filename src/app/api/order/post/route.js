import Orders from "@/models/order_header";
import OrderDetails from "@/models/order_details";
import Code from "@/models/code";
import ProductCode from "@/models/product_code";
import Purchases from "@/models/purchases";
import MUnilevel from "@/models/monthly_unilevel";
import MUDetails from "@/models/monthly_unilevel_detail";
import Earning from '@/models/earning'
import EarningTransaction from "@/models/earning_transaction";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";
import Member from "@/models/member";
import _ from "lodash";
import { STAIRSTEP_RANK, ROYALTY_RANK, RANKS } from "@/utils/constants";
import { updateBalance, saveH2CWallet } from "../../genealogy/activateFunc";
import Provinces from "@/models/province";
import City from  "@/models/city";

const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();


export const POST = async (request) => {

    var body =  await request.json();

    try {       

        await connect()    

        let orderH = await Orders.findById(body._id).populate({ path: "member_id"})
        if (orderH.status===1){
            var _err = { name: "Order already posted."};          
            return NextResponse.json(_err, { status: 500 });
        }         

        await postOrder(body.isHub, orderH)
      
        await Orders.findByIdAndUpdate(body._id, { status: 1 })

        return NextResponse.json(body._id, { status: 200 });

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}

const postOrder = async (isHub, orderH)=>{

    let orderD = await OrderDetails.find({ order_header_id: orderH._id }).populate('product_id')
    
    if (orderH.repeatorder===1){     
        for (let od of orderD){
            if(!od.product_id.isProdPackage || !od.product_id.isMembership){
                var m_subtotal = isHub ? od.product_id.hub_price : od.product_id.member_price
                var data = {
                    member_id: orderH.member_id._id,
                    account_type: orderH.member_id.account_type,
                    transdate: moment().toDate(),
                    transtime: moment().toDate(),
                    order_id: orderH._id,
                    product_id: od.product_id._id,
                    productname: od.product_id.productname,
                    price: parseFloat(od.price),
                    discountedprice: parseFloat(m_subtotal),
                    qty: parseFloat(od.qty),
                    discount: (parseFloat(od.price) - m_subtotal) * parseFloat(od.qty),
                    subtotal: m_subtotal * parseFloat(od.qty),
                    productcode: "",    
                    transtype: 0
                }
                let newPurchase = await new Purchases(data).save()
                if (newPurchase) {    
                    if (od.product_id.h2c_wallet>0){
                        let h2cwallet = od.product_id.h2c_wallet * parseInt(newPurchase.qty)
                        await saveH2CWallet(orderH.member_id, h2cwallet)
                    }   
                    if (od.product_id.hub_profit>0){
                        let hubprofit = od.product_id.hub_profit * parseInt(newPurchase.qty)
                        await checkSaveHubRoyalty(orderH.member_id, hubprofit)         
                    }
                    
                    await checkHasHeader(orderH.member_id._id, newPurchase.transdate)
                    await updateMonthlyUnilevelBalance(orderH.member_id._id, newPurchase.transdate)
                    if (od.product_id.stairstep_alloc>0){
                        var maxA =  od.product_id.stairstep_alloc * parseInt(newPurchase.qty)
                        await checkStairstep(orderH.member_id._id, newPurchase, maxA)
                    }

                    if (od.product_id.unilevel_alloc>0){
                        await checkUnilevel(orderH.member_id._id, od.product_id, newPurchase, orderH)                        
                    }
                }                
            }
        }       
    }

    if (orderH.hasactivationcodes===1){
        for (let od of orderD){
            if(od.product_id.isProdPackage && od.product_id.isMembership){
                console.log("--generateActivateCode....")
                await generateActivateCode(orderH.member_id._id, od, orderH)
            }
        }
    }

    if (orderH.hascodes===1){
        for (let od of orderD){
            if(!od.product_id.isProdPackage || !od.product_id.isMembership){
                console.log("--generateProductCode....")
                await generateProductCode(orderH.member_id._id, od, orderH, isHub)
            }
        }
    }
}

const checkSaveHubRoyalty = async (newm, amount)=>{

    if (!newm.city){
        console.log("No city defined")
        return false
    }

    let bHub = await Member.findOne({isHub: true, hubtype: 0, hub_city: newm.city, activated:true})
    if (!bHub){
        console.log("No municipal hub.")
        bHub = await Member.findOne({isHub: true, hubtype: 1, hub_city: newm.city})
        if (!bHub){
            console.log("No city hub.")
            let cC = await City.findOne({ _id: newm.city })
            if (cC){
                let cProv = await Provinces.findOne({value: cC.province})
                if (cProv){
                    bHub = await Member.findOne({isHub: true, hubtype: 2, hub_province: cProv._id, activated:true})
                }
            }
        }
    }

    if (!bHub){
        // main account
        bHub = await Member.findById("68bbcda70b12e0477ccb75df") //main hub
    }

    let eheader = await Earning.findOne({member_id: bHub._id})
    if (!eheader){
        console.log("No header.")
        return false
    }
    
    try{

        let newData = [           
            {
                earning_id: eheader._id,
                transdate: moment().toDate(),
                earning_type: 12,
                amount: amount,
                net_amount: amount,
                trans_type: 2,
                remarks: "",
                from_member_id: newm._id
            },
        ]
       
        await EarningTransaction.insertMany(newData)        
        await updateBalance(eheader._id, newm.rank)                

    }catch(err){
        console.log(err)
        return false
    }
}


const generateActivateCode = async (id, item, order)=>{

    console.log(order._id)

    try { 

        const options = {
            upperCaseAlpha: true,
            number: true,
            specialCharacter: false,
            minimumLength: 10,
            maximumLength: 12,
            exactLength: 12
        };


        for (let i = 0; i < item.qty; i++) {
            let codenum;
            let isUnique = false;
            // Try generating a unique code
            while (!isUnique) {
                codenum = passwordGenerator.generatePassword(options).toUpperCase();
                const exists = await Code.findOne({ codenum: { $regex: new RegExp('^' + codenum + '$', "i") } });
                if (!exists) {
                    isUnique = true;
                }
            }
            // console.log(codenum)
            const mdata = {
                date_created: new Date(),
                time_created: new Date(),
                datetime_sent: new Date(),
                member_id: id,
                sender_id: '68bbcda70b12e0477ccb75df',
                datetime_used: null,
                codenum: codenum,
                status: 0,    
                isCD: false,  
                codetype: 0, 
                order_id: order._id  
            };
            // console.log(mdata)
            const newCode = new Code(mdata);
            await newCode.save();      
        }        

    }catch(err){
        return err
    }

}

const generateProductCode = async (id, item, order, isHub)=>{

    try {

        const options = {
            upperCaseAlpha: true,
            number: true,
            specialCharacter: false,
            minimumLength: 8,
            maximumLength: 8,
            exactLength: 8
        }

        const options1 = {
            upperCaseAlpha: true,
            number: true,
            specialCharacter: false,
            minimumLength: 6,
            maximumLength: 6,
            exactLength: 6
        }

        for (let i = 0; i < item.qty; i++) {
            let codenum;
            let isUnique = false;
            // Try generating a unique code
            while (!isUnique) {
                codenum = passwordGenerator.generatePassword(options).toUpperCase();
                const exists = await ProductCode.findOne({ codenum: { $regex: new RegExp('^' + codenum + '$', "i") } });
                if (!exists) {
                    isUnique = true;
                }
            }

            var m_subtotal = isHub ? item.product_id.hub_price : item.product_id.member_price
            var obj = {
                member_id: id,
                sender_id: "68bbcda70b12e0477ccb75df",
                datetime_sent: moment().toDate(),
                codenum: codenum,             
                date_created: moment().toDate(),
                time_created: moment().toDate(),
                datetime_used: null,
                activated_by: null,
                expiry_date: null,
                order_id: order._id,
                product_id: item.product_id._id,
                productname: item.product_id.productname,           
                discountedprice: m_subtotal,
                price: item.price,
                discount: parseFloat(item.price) - parseFloat(m_subtotal),
                subtotal: m_subtotal,                                  
                status: 0,
            } 

            const newProductCode = new ProductCode(obj);
            await newProductCode.save();

        }

    }catch(err){
        return err
    }    
}

const checkHasHeader = async (id, transdate)=>{

    var nYear = moment(transdate).year()
    var nMonth = moment(transdate).month()
    
    let mu = await MUnilevel.findOne({ member_id: id, nmonth: nMonth, nyear: nYear })

    if (!mu){
        var data = {
            member_id: id,
            nmonth: nMonth,
            nyear: nYear,
            personalsales: 0,
            groupsales: 0,
            unilevel: 0,
            status: 0,
            ispaid: 0
        }
        let newMu = await new MUnilevel(data).save()
        return newMu
    }else{
        return mu
    }
}


const updateMonthlyUnilevelBalance = async (id, transdate)=>{

    var updateParam = {
        personalsales: 0,
        groupsales: 0,
        unilevel: 0,
    }

    var dfrom = null
    var dto = null

    var nYear = moment(transdate).year()
    var nMonth = moment(transdate).month()

    let header = await  MUnilevel.findOne({ member_id: id, nmonth: nMonth, nyear: nYear })
    if (header){
        dfrom = moment().month(header.nmonth).year(header.nyear).startOf('month').toDate()
        dto = moment().month(header.nmonth).year(header.nyear).endOf('month').toDate()
    }


    let ps = await Purchases.aggregate([
                {
                    $match: { member_id: header.member_id, transdate: { $gte: dfrom, $lte: dto } }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$subtotal" }
                    }
                }
            ])

    if (ps.length > 0) {
        updateParam.personalsales = ps[0].total
        if (updateParam.personalsales < 0) { updateParam.personalsales = 0 }
    } 

    let dtls = await MUDetails.find({ monthly_unilevel_id: header._id }).populate('purchase_id')

    updateParam.groupsales = _.sumBy(dtls, function (o) { return !_.isEmpty(o.purchase_id) ? o.purchase_id.subtotal : 0 });
    updateParam.unilevel = _.sumBy(dtls, function (o) { return o.points });

    console.log("Updating MU Header:", header._id, updateParam)
    await MUnilevel.findByIdAndUpdate(header._id, updateParam)

}


const checkStairstepQualified = (maxA, counter, newm, runningStairStepAmount)=>{
      
    var retVal = {
        hasStairstep: true,
        stairstepAmount: 0,
        differentialAmount: 0
    } 
        
    try {       
        if (counter.level>1){        
            // console.log("-> current rank 1: ("+ counter.currentsponsor.username + ") " + RANKS[counter.currentsponsor.rank].label + " === prev rank: ("+ counter.prevSponsor.username + ") " +  RANKS[counter.prevSponsor.rank].label)  
            if (counter.currentsponsor.rank>0){
                if (runningStairStepAmount>0){
                //  console.log("--has stairstep--3")               
                    if (counter.currentsponsor.rank>counter.prevSponsor.rank){                    
                        let perc = 0                   
                        if (counter.prevRankWithStairstep){
                            // console.log("-> current rank 2: ("+ counter.currentsponsor.username + ") " + RANKS[counter.currentsponsor.rank].label + " === prev rank: ("+ counter.prevRankWithStairstep.username + ") " +  RANKS[counter.prevRankWithStairstep.rank].label)  
                            perc = STAIRSTEP_RANK[counter.currentsponsor.rank-1] - STAIRSTEP_RANK[counter.prevRankWithStairstep.rank-1]          
                        }
                        if (perc>0){
                            // console.log("% bonus 1: " + perc)                                
                            retVal.stairstepAmount = (maxA * perc)/100                                        
                            if (retVal.stairstepAmount<0){
                                retVal.stairstepAmount = 0
                            }
                        }else{
                            // console.log("--no stairstep")         
                            retVal.hasStairstep = false    
                        }
                        
                    }else{
                        // console.log("--no stairstep")         
                        retVal.hasStairstep = false
                    }
                        
                }else{
                    // stairstep
                    // console.log("--has stairstep--2")  
                    // console.log("% bonus 2 : " + STAIRSTEP_RANK[counter.currentsponsor.rank-1])  
                    retVal.stairstepAmount = (maxA * STAIRSTEP_RANK[counter.currentsponsor.rank-1])/100          
                }
            }else{
                retVal.hasStairstep = false                
            }

        }else{
            if (counter.currentsponsor.rank>0){
                // console.log("--has stairstep--1")  
                // console.log("% bonus 3: " + STAIRSTEP_RANK[counter.currentsponsor.rank-1])  
                retVal.stairstepAmount = (maxA * STAIRSTEP_RANK[counter.currentsponsor.rank-1])/100          
            }else{
                retVal.hasStairstep = false            
            }
        }
        
    }catch(err){
        console.log(err)
    }

    return retVal

}


const checkStairstep = async (id, purch, maxA)=>{

    async function getMemberInfo (mid) {      
        const retVv = await Member.findById(mid).populate('sponsorid')         
        return retVv                             
    }

    var memberRes = await getMemberInfo(id)

    if (memberRes){
        
        var counter = {
            parent_id: memberRes.sponsorid?memberRes.sponsorid._id:null,
            child_id: id,            
            currentsponsor: memberRes.sponsorid?memberRes.sponsorid:null,
            level: 1,
            runningStairStepAmount: 0,          
            prevSponsor: null,
            prevRankWithStairstep: null
        }

        while(counter.parent_id !=null){

            let retV = checkStairstepQualified(maxA, counter, memberRes, counter.runningStairStepAmount)    
            counter.runningStairStepAmount = counter.runningStairStepAmount +  retV.stairstepAmount       
            if (retV.hasStairstep && retV.stairstepAmount>0){
                // console.log("store prevRankWithStairstep")                        
                console.log(" --------------- stairstep ---> " + RANKS[counter.currentsponsor.rank].label + ") - " +  retV.stairstepAmount )
                await saveStairstepBonus(memberRes._id, counter.currentsponsor._id, retV.stairstepAmount)
                counter.prevRankWithStairstep = counter.currentsponsor
                await checkRoyalty(counter.currentsponsor._id, retV.stairstepAmount)
            }   
            
            let nextParent =  await getMemberInfo(counter.parent_id)         
            if (counter.runningStairStepAmount>=maxA){
                nextParent = null
            }

            if (nextParent){
                         
                counter.prevSponsor = counter.currentsponsor
                counter.parent_id = nextParent.sponsorid?nextParent.sponsorid._id : null
                counter.currentsponsor = nextParent.sponsorid                                
                counter.level += 1                   
                
            }else{
                counter.parent_id = null
            }

        }
    }
    
}


const saveStairstepBonus = async (new_id, id, amount)=>{

    let memb = await Member.findById(id)
    if (!memb){
        console.log("No member.")
        return false
    }


    let eheader = await Earning.findOne({member_id: memb._id})
    if (!eheader){
        console.log("No header.")
        return false
    }

    try{

        let newData = [           
            {
                earning_id: eheader._id,
                transdate: moment().toDate(),
                earning_type: 3,
                amount: amount,
                net_amount: amount,            
                trans_type: 1, // from repeat purchase
                remarks: "",
                from_member_id: new_id
            },
        ]
        await EarningTransaction.insertMany(newData)        
        await updateBalance(eheader._id, memb.rank)                 

    }catch(err){
        console.log(err)
        return false
    }
}


const checkRoyalty= async (id, amount)=>{

  
    async function getMemberInfo (mid) {      
        const retVv = await Member.findById(mid).populate('sponsorid')         
        return retVv                             
    }

    var memberRes = await getMemberInfo(id)

    if (memberRes){
          console.log("----checkRoyalty---> " + memberRes.username)
        var counter = {
            parent_id: memberRes.sponsorid?memberRes.sponsorid._id:null,
            child_id: id,            
            currentsponsor: memberRes.sponsorid,
            level: 1,            
        }
         while(counter.parent_id !=null && counter.level<6){
            
            if (counter.currentsponsor.rank>0){
                console.log(counter.currentsponsor.username + " ---- level :" + counter.level)
                let perc = ROYALTY_RANK[counter.level-1]
                // console.log("perc:" + perc)
                let ramount =   (amount * perc)/100                    
                await saveRoyaltyBonus(memberRes._id, counter.currentsponsor._id, ramount, counter.level)
            }
                                   
            let nextParent =  await getMemberInfo(counter.parent_id)                     
                     
            if (nextParent){                         
                counter.parent_id = nextParent.sponsorid?nextParent.sponsorid._id : null
                counter.currentsponsor = nextParent.sponsorid                
                counter.currentsponsor = nextParent.sponsorid               
                counter.level += 1    
                
            }else{
                counter.parent_id = null
            }
        }          

    }

}

const saveRoyaltyBonus = async (new_id, id, amount, level)=>{


    let memb = await Member.findById(id)
    if (!memb){
        console.log("No member.")
        return false
    }

    let eheader = await Earning.findOne({member_id: memb._id})
    if (!eheader){
        console.log("No header.")
        return false
    }
    
    try{

        let newData = [           
            {
                earning_id: eheader._id,
                transdate: moment().toDate(),
                earning_type: 5,
                amount: amount,
                net_amount: amount,            
                trans_type: 1, // from repeat purchase
                remarks: "",
                level: level,
                from_member_id: new_id
            },
        ]

        // console.log(newData)
        await EarningTransaction.insertMany(newData)        
        await updateBalance(eheader._id, memb.rank)                 

    }catch(err){
        console.log(err)
        return false
    }
}


const saveUnilevelPoints = async (counter, product, purch, order)=>{

    if (counter.level==1 || counter.level > 10){
        console.log("1")
        return
    }

    if (!counter.member){
        console.log("2")
        return
    }

    
    if (!counter.member.activated){
        console.log("3")
        return
    }

    if (product.unilevel_alloc<=0){                
        console.log("4")
        return
    }

    let header = await checkHasHeader(counter.member._id, purch.transdate)

    let amount = product.unilevel_alloc / 10


    console.log("Unilevel points for " + counter.member.username + " level " + counter.level + " : " + amount)
    
    var data = {
        monthly_unilevel_id: header._id,
        transdate: order.transdate,
        order_id: order._id,
        purchase_id: purch._id,
        points: amount,
        level: counter.level,
        transtype: 0
    }    

    await new MUDetails(data).save()

    await updateMonthlyUnilevelBalance(counter.member._id, purch.transdate)
            
}


const checkUnilevel = async (id, product, purch, order)=>{

    // console.log("checkUnilevel...")

    async function getMemberInfo (mid) {      
        const retVv = await Member.findById(mid).populate('sponsorid')         
        return retVv                             
    }   
    
    var memberRes= await getMemberInfo(id)

    if (memberRes){
        var counter = {
            parent_id: memberRes.sponsorid?memberRes.sponsorid._id:null,
            child_id: id,
            member: memberRes?.sponsorid,
            level: 1,
            runningPercent: 0,
            currentsponsor: memberRes?.sponsorid,
            prevSponsor: null
        }
        while(counter.parent_id !=null && counter.level<=10){

            // console.log(counter.member.username)
                       
            await saveUnilevelPoints(counter, product, purch, order)           

            const nextParent = await getMemberInfo(counter.parent_id)

            if (nextParent){
                counter.parent_id = nextParent.sponsorid?nextParent.sponsorid._id : null
                counter.member = nextParent.sponsorid
                counter.level += 1                
            }else{
                counter.parent_id = null
            }
        }          
    }   
}