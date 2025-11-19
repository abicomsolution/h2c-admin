import Orders from "@/models/order_header";
import OrderDetails from "@/models/order_details";
import Purchases from "@/models/purchases";
import MUnilevel from "@/models/monthly_unilevel";
import MUDetails from "@/models/monthly_unilevel_detail";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";

export const POST = async (request) => {

    var body =  await request.json();

    try {       

        await connect()    

        let orderH = await Orders.findById(body._id).populate({ path: "member_id", select: "fullname account_type status rank" })
        if (orderH.status===1){
            var _err = { name: "Order already posted."};          
            return NextResponse.json(_err, { status: 500 });
        }
   
        // await Orders.findByIdAndUpdate(body._id, { status: 1 })

        await postOrder(body.isHub, orderH)

        return NextResponse.json(body._id, { status: 200 });

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}

const postOrder = async (isHub, orderH)=>{

    if (orderH.repeatorder===1){
        let orderD = await OrderDetails.find({ order_header_id: orderH._id }).populate('product_id')
        for (let od of orderD){
            if(!od.product_id.isProdPackage || !od.product_id.isMembership){
                var m_subtotal = isHub ? item.product_id.hub_price : item.product_id.member_price
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
                    await checkHasHeader(orderH.member_id._id, newPurchase.transdate)

                }
                
            }
        }       
    }
}

const checkHasHeader = async (id, transdate)=>{

    var nYear = moment(transdate).year()
    var nMonth = moment(transdate).month()
    
    let mu = await MUnilevel.findOne({ member_id: new ObjectId(id), nmonth: nMonth, nyear: nYear })

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

    let header = await  MUnilevel.findOne({ member_id: new ObjectId(id), nmonth: nMonth, nyear: nYear })
    if (header){
        dfrom = moment().month(header.nmonth).year(header.nyear).startOf('month').toDate()
        dto = moment().month(header.nmonth).year(header.nyear).endOf('month').toDate()
    }


    let ps = await Purchases.aggregate([
                {
                    $match: { member_id: new ObjectId(header.member_id), transdate: { $gte: dfrom, $lte: dto } }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$subtotal" }
                    }
                }
            ])



}

