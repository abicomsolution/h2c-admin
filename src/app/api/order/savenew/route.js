import Orders from "@/models/order_header";
import OrderDetails from "@/models/order_details";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";

export const POST = async (request) => {

    var body =  await request.json();

    try {       

        await connect()    
        
        let orderNum = await Orders.countDocuments({}) + 1;

        let params = {
            transdate: moment(body.transdate).toDate(),
            member_id: body.member_id._id,
            order_num: orderNum,
            cash_payment: body.cash_payment,
            bank_payment: body.bank_payment,
            cc_payment: body.cc_payment,
            ewallet_payment: body.ewallet_payment,
            total_amount: body.total_amount,
            payment_ref_num: body.payment_ref_num,
            repeatorder: body.repeatorder,
            hascodes: body.hascodes,
            trans_type: 0,
            hasactivationcodes: body.hasactivationcodes,           
            shipping_address: body.shipping_address,
            remarks: body.remarks,            
            subtotal: body.subtotal
        }

        let newOrder = new Orders(params)
        let savedOrder = await newOrder.save()


        for await (const item of body.details){
            let detailParams = {
                order_header_id: savedOrder._id,
                product_id: item.product_id._id,
                price: item.price,
                uom: item.uom,
                qty: item.qty,
                discountedprice: item.discountedprice,
                subtotal: item.subtotal
            }   
            let newDetail = new OrderDetails(detailParams)
            await newDetail.save()
        }
       
        return NextResponse.json(savedOrder._id, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}