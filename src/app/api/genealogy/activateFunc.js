import Member from "@/models/member";
import moment from 'moment'
import Earning from '@/models/earning'
import EarningTransaction from "@/models/earning_transaction";
import { H2C_TOPUP, DIRECT_REFERRAL, INDIRECT_REFERRAL, STAIRSTEP_ALLOC, STAIRSTEP_RANK, RANKS, ROYALTY_RANK} from "@/utils/constants";
import _ from "lodash";


export  const activate = async (id)=>{

    let tdata = await Member.findById(id)
            
    await saveDirectRef(tdata)               

    await checkUnilevel(tdata._id)         
  
    await checkStairstep(tdata._id)     

    await updateMemberStatus(tdata._id)
           
}



const saveDirectRef = async (newm)=>{

  
    let sponsor = await Member.findById(newm.sponsorid).populate('sponsorid')
    if (!sponsor){
        console.log("No sponsor.")
        return false
    }

    let eheader = await Earning.findOne({member_id: sponsor._id})
    if (!eheader){
        console.log("No header.")
        return false
    }

    try{

        let newData = [           
            {
                earning_id: eheader._id,
                transdate: moment().toDate(),
                earning_type: 1,
                amount: DIRECT_REFERRAL,
                net_amount: DIRECT_REFERRAL,            
                trans_type: 1,
                remarks: "",
                from_member_id: newm._id
            },
        ]
        await EarningTransaction.insertMany(newData)        
        await updateBalance(eheader._id, sponsor.rank)
         
        let bHasChange = await checkRank(sponsor)
        if (bHasChange){          
            if (sponsor.sponsorid){
                console.log("has changed")
                await checkRank(sponsor.sponsorid)
            }          
        }

    }catch(err){
        console.log(err)
        return false
    }
}

export const updateBalance = async (id, rank)=>{

    let updateData = {
        topup: 0,
        direct: 0,       
        ctp: 0,
        royalty: 0,
        direct_transferred: 0,
        direct_balance: 0,

        indirect_lvl_1: 0,
        indirect_lvl_1_paid: 0,        

        indirect_lvl_2: 0,
        indirect_lvl_2_paid: 0,

        indirect_lvl_3: 0,
        indirect_lvl_3_paid: 0,        

        indirect_lvl_4: 0,
        indirect_lvl_4_paid: 0,        

        indirect_lvl_5: 0,
        indirect_lvl_5_paid: 0,        

        indirect_lvl_6: 0,
        indirect_lvl_6_paid: 0,        
        
        indirect_lvl_7: 0,
        indirect_lvl_7_paid: 0,        

        indirect_lvl_8: 0,
        indirect_lvl_8_paid: 0,        

        indirect_lvl_9: 0,
        indirect_lvl_9_paid: 0,        

        indirect_lvl_10: 0,
        indirect_lvl_10_paid: 0,        

        indirect: 0,
        indirect_available: 0,
        indirect_transferred: 0,
        indirect_balance: 0,

        ctp_transferred: 0,
        ctp_balance: 0,
        royalty_transferred: 0,
        royalty_balance: 0,
        unilevel_transferred: 0,
        unilevel_balance: 0,
        transferred: 0,
        accumulated: 0,
        net_balance: 0,
        balance: 0    
    }

    updateData.topup = await queryTransactions(id, 0)
    updateData.direct = await queryTransactions(id, 1)    
    updateData.ctp = await queryTransactions(id, 3)
    updateData.unilevel = await queryTransactions(id, 4)
    updateData.royalty = await queryTransactions(id, 5)

    updateData.direct_transferred = await queryTransactions(id, 6)    
    updateData.ctp_transferred = await queryTransactions(id, 8)
    updateData.unilevel_transferred = await queryTransactions(id, 9)
    updateData.royalty_transferred = await queryTransactions(id, 10)

    //supervisor and up
    //******************************* */
    // updateData.indirect_lvl_1 = await queryIndirectTransactions(id, 1)    
    // if (rank>0){
    //     updateData.indirect_lvl_1_paid = updateData.indirect_lvl_1
    // }

    updateData.indirect_lvl_2 = await queryIndirectTransactions(id, 2)    
    if (rank>0){
        updateData.indirect_lvl_2_paid = updateData.indirect_lvl_2
    }

    updateData.indirect_lvl_3 = await queryIndirectTransactions(id, 3)    
    if (rank>0){
        updateData.indirect_lvl_3_paid = updateData.indirect_lvl_3
    }

    updateData.indirect_lvl_4 = await queryIndirectTransactions(id, 4)    
    if (rank>0){
        updateData.indirect_lvl_4_paid = updateData.indirect_lvl_4
    }
    //******************************* */
    //manager and up
    updateData.indirect_lvl_5 = await queryIndirectTransactions(id, 5)    
    if (rank>1){
        updateData.indirect_lvl_5_paid = updateData.indirect_lvl_5
    }

    updateData.indirect_lvl_6 = await queryIndirectTransactions(id, 6)    
    if (rank>1){
        updateData.indirect_lvl_6_paid = updateData.indirect_lvl_6
    }
    
    //******************************* */
    //director and up
    updateData.indirect_lvl_7 = await queryIndirectTransactions(id, 7)    
    if (rank>2){
        updateData.indirect_lvl_7_paid = updateData.indirect_lvl_7
    }

    updateData.indirect_lvl_8 = await queryIndirectTransactions(id, 8)    
    if (rank>2){
        updateData.indirect_lvl_8_paid = updateData.indirect_lvl_8
    }

    //******************************* */
    //ambassador and up
    updateData.indirect_lvl_9 = await queryIndirectTransactions(id, 9)    
    if (rank>3){
        updateData.indirect_lvl_9_paid = updateData.indirect_lvl_9
    }

    updateData.indirect_lvl_10 = await queryIndirectTransactions(id, 10)    
    if (rank>3){
        updateData.indirect_lvl_10_paid = updateData.indirect_lvl_10    
    }

    //******************************* */    
    updateData.indirect = await queryTransactions(id, 2)

    // updateData.indirect_lvl_1_paid +
    updateData.indirect_available =  updateData.indirect_lvl_2_paid + updateData.indirect_lvl_3_paid + updateData.indirect_lvl_4_paid + updateData.indirect_lvl_5_paid + updateData.indirect_lvl_6_paid + updateData.indirect_lvl_7_paid + updateData.indirect_lvl_8_paid + updateData.indirect_lvl_9_paid + updateData.indirect_lvl_10_paid
    updateData.indirect_transferred = await queryTransactions(id, 7)

    updateData.direct_balance = updateData.direct - updateData.direct_transferred
    if (updateData.direct_balance < 0) { updateData.direct_balance = 0 }

    updateData.indirect_balance = updateData.indirect_available - updateData.indirect_transferred
    if (updateData.indirect_balance < 0) { updateData.indirect_balance = 0 }

    updateData.ctp_balance = updateData.ctp - updateData.ctp_transferred
    if (updateData.ctp_balance < 0) { updateData.ctp_balance = 0 }

    updateData.unilevel_balance = updateData.unilevel - updateData.unilevel_transferred
    if (updateData.unilevel_balance < 0) { updateData.unilevel_balance = 0 }

    updateData.royalty_balance = updateData.royalty - updateData.royalty_transferred
    if (updateData.royalty_balance < 0) { updateData.royalty_balance = 0 }
    
    updateData.transferred = updateData.direct_transferred + updateData.indirect_transferred + updateData.ctp_transferred + updateData.unilevel_transferred + updateData.royalty_transferred    

    updateData.accumulated =  updateData.direct + updateData.indirect_available + updateData.ctp + updateData.unilevel + updateData.royalty
    updateData.balance = updateData.accumulated - updateData.transferred   
    if (updateData.balance<0){
        updateData.balance = 0
    }
    updateData.net_balance = updateData.balance

    // console.log(updateData)
    
    await Earning.findByIdAndUpdate(id, updateData)
}


const queryTransactions = async (id, ctype)=>{

    let retAmount = 0

    try{
        let result = await EarningTransaction.aggregate(
            [
                {
                    $match: { earning_id: id, earning_type: ctype }
                },
                {
                    $group: {
                        _id: { pid: "$earning_id", ptype: "$earning_type" },
                        total: { $sum: "$amount" }
                    }
                }
            ]
        )        
        if (!_.isEmpty(result)) {
            if (result.length > 0) {
                retAmount = result[0].total
                if (retAmount < 0) { retAmount = 0 }
            }
        }

        return retAmount;     

    } catch (err) {    
        console.log(err)   
        return 0
    }

}

const queryIndirectTransactions = async (id, level)=>{

    let retAmount = 0

    try{
        let result = await EarningTransaction.aggregate(
            [
                {
                    $match: { earning_id: id, earning_type: 2, level: level }
                },
                {
                    $group: {
                        _id: { pid: "$earning_id", ptype: "$earning_type" },
                        total: { $sum: "$amount" }
                    }
                }
            ]
        )        
        if (!_.isEmpty(result)) {
            if (result.length > 0) {
                retAmount = result[0].total
                if (retAmount < 0) { retAmount = 0 }
            }
        }

        return retAmount;     

    } catch (err) {    
        console.log(err)   
        return 0
    }

}

const saveInDirectRef = async (counter)=>{

    // console.log(counter)

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
    
    // if (counter.member.rank==0){
    //     console.log("4")
    //     return
    // }

    let eheader = await Earning.findOne({member_id: counter.member._id}).populate('member_id')
    
    if (!eheader){
        console.log("5")
        return
    }
    
    try{

        let amount = 0

        if (counter.level<5){
            amount = INDIRECT_REFERRAL[counter.level-1]
        }else if (counter.level<7){
            amount = INDIRECT_REFERRAL[counter.level-1]
        }else if (counter.level<9){
            amount = INDIRECT_REFERRAL[counter.level-1]
        }else if (counter.level<=10){
            amount = INDIRECT_REFERRAL[counter.level-1]
        }

        let newData = {
            earning_id: eheader._id,
            transdate: moment().toDate(),
            earning_type: 2,
            amount: amount,
            net_amount: amount,            
            trans_type: 0,
            remarks: "",
            level: counter.level,
            from_member_id: counter.child_id
        }
        // console.log(newData)
        let newET = new EarningTransaction(newData)
        await newET.save()

        await updateBalance(eheader._id, eheader.member_id.rank)

    }catch(err){
        console.log(err)
        return
    }
    
}

const checkUnilevel = async (id)=>{

    // console.log("checkUnilevel...")

    async function getMemberInfo (mid) {      
        const retVv = await Member.findById(mid).populate('sponsorid')         
        return retVv                             
    }   
    
    var memberRes= await getMemberInfo(id)

    if (memberRes){
        var counter = {
            parent_id: memberRes.sponsorid._id,
            child_id: id,
            member: memberRes.sponsorid,
            level: 1,
            runningPercent: 0,
            currentsponsor: memberRes.sponsorid,
            prevSponsor: null
        }
        while(counter.parent_id !=null){

            // console.log(counter.member.username)
           
            await saveInDirectRef(counter)           

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

const updateMemberStatus = async (id)=>{
     
    let params = {  
        isCd: false,
        isUpgraded: true,
        date_upgraded: moment().toDate()        
    }

    await Member.findByIdAndUpdate(id, params)
}

const checkRank = async (newm)=>{

    let bHasChange = false
    console.log("checkRank..." + newm.username)
    
    let drs = await Member.find({sponsorid: newm._id, activated: true})

    let count = drs.length

    let supervisor = drs.filter(member => member.rank === 1).length
    let manager = drs.filter(member => member.rank === 2).length
    let director = drs.filter(member => member.rank === 3).length    

    let rank = 0
    if (count >= 50  && director >=6){
        rank = 4
    }else if (count >=30 && manager >=4){
        rank = 3
    }else if (count >=20 && supervisor >=2){
        rank = 2
     }else if (count >=10){
        rank = 1
    }

    console.log("count..." + count + " rank: " + rank)

    if (rank > 0){        
        if (rank > newm.rank ){
            bHasChange = true
            await Member.findByIdAndUpdate(newm._id, {rank: rank})               
            let hd = await Earning.findOne({member_id: newm._id})
            await updateBalance(hd._id, rank)
        }
    }
    return bHasChange
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
                trans_type: 0,
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



const checkStairstep = async (id)=>{


    async function getMemberInfo (mid) {      
        const retVv = await Member.findById(mid).populate('sponsorid')         
        return retVv                             
    }

    var memberRes = await getMemberInfo(id)

    if (memberRes){
        var counter = {
            parent_id: memberRes.sponsorid._id,
            child_id: id,            
            currentsponsor: memberRes.sponsorid,
            level: 1,
            runningStairStepAmount: 0,          
            prevSponsor: null,
            prevRankWithStairstep: null
        }
         while(counter.parent_id !=null){

            // console.log(counter.currentsponsor.username)
           
            let retV = checkStairstepQualified(counter, memberRes, counter.runningStairStepAmount)          
            counter.runningStairStepAmount = counter.runningStairStepAmount +  retV.stairstepAmount 
            // console.log(" stairstep amount: " + retV.stairstepAmount + " , " + " diferential amount: " + retV.differentialAmount)          
            // console.log(" runningStairStepAmount: " + counter. runningStairStepAmount)         
            if (retV.hasStairstep && retV.stairstepAmount>0){
                // console.log("store prevRankWithStairstep")                        
                console.log(" --------------- stairstep ---> " + RANKS[counter.currentsponsor.rank].label + ") - " +  retV.stairstepAmount )
                await saveStairstepBonus(memberRes._id, counter.currentsponsor._id, retV.stairstepAmount)
                counter.prevRankWithStairstep = counter.currentsponsor
                await checkRoyalty(counter.currentsponsor._id, retV.stairstepAmount)
            }       
            
            let nextParent =  await getMemberInfo(counter.parent_id)         
            if (counter.runningStairStepAmount>=50){
                nextParent = null
            }
                     
            if (nextParent){
                         
                counter.prevSponsor = counter.currentsponsor
                counter.parent_id = nextParent.sponsorid?nextParent.sponsorid._id : null
                counter.currentsponsor = nextParent.sponsorid                                        
                counter.level += 1    
                 
                // console.log("curr : " + counter.currentsponsor?.username)
                // if (counter.prevSponsor){
                //     console.log("newv : " + counter.prevSponsor.username)
                // }
                
            }else{
                counter.parent_id = null
            }
        }          

    }

}


const checkStairstepQualified = (counter, newm, runningStairStepAmount)=>{
      
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
                            retVal.stairstepAmount = (STAIRSTEP_ALLOC * perc)/100                                        
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
                    retVal.stairstepAmount = (STAIRSTEP_ALLOC* STAIRSTEP_RANK[counter.currentsponsor.rank-1])/100          
                }
            }else{
                retVal.hasStairstep = false                
            }

        }else{
            if (counter.currentsponsor.rank>0){
                // console.log("--has stairstep--1")  
                // console.log("% bonus 3: " + STAIRSTEP_RANK[counter.currentsponsor.rank-1])  
                retVal.stairstepAmount = (STAIRSTEP_ALLOC* STAIRSTEP_RANK[counter.currentsponsor.rank-1])/100          
            }else{
                retVal.hasStairstep = false            
            }
        }
        
    }catch(err){
        console.log(err)
    }

    return retVal

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
                trans_type: 0,
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


export const saveH2CWallet = async (newm, amount)=>{

    let eheader = await Earning.findOne({member_id: newm._id}).populate('member_id')
    
    if (!eheader){
        return false
    }
 
    try{

        let newData = {
            earning_id: eheader._id,
            transdate: moment().toDate(),
            earning_type: 0,
            amount: amount,
            net_amount: amount,            
            trans_type: 1,
            remarks: "",
            from_member_id: null
        }

        let newET = new EarningTransaction(newData)
        await newET.save()

        await updateBalance(eheader._id, eheader.member_id.rank)

    }catch(err){
        console.log(err)
        return false
    }
   

}


export  const refreshBalance = async ()=>{

    const earnings = await Earning.find({});
    for (const earning of earnings) {
        const member = await Member.findById(earning.member_id);
        console.log("Refreshing balance for member: " + member.username);
        const rank = member ? member.rank : 0;
        await updateBalance(earning._id, rank);
    }

}