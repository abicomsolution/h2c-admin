import Orders from "@/models/order_header";
import OrderDetails from "@/models/order_details";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";

export const POST = async (request) => {

    var body =  await request.json();

    try {       

        await connect()    
            
        let params = {
            transdate: moment(body.transdate).toDate(),
            member_id: body.member_id._id,            
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

        await Orders.findByIdAndUpdate(body._id, params)
        
        var bulkOpt = []
        for await (const e of body.details){
            if (e.onInsert) {
                obj = {
                    insertOne: {
                        document: {
                            order_header_id: body._id,
                            product_id: e.product_id._id,
                            price: e.price,
                            discountedprice: e.discountedprice,
                            qty: e.qty,
                            discount: e.discount,
                            subtotal: e.subtotal,
                            uom: e.uom
                        }
                    }
                }
                bulkOpt.push(obj)
            } else if (e.onDelete) {
                var obj = {
                    deleteOne: {
                        filter: { _id: e._id }
                    }
                }
                bulkOpt.push(obj)
            }else{
                var obj = {
                    updateOne: {
                        filter: { _id: e._id },
                        update: {
                            $set: {
                                order_header_id: body._id,
                                product_id: e.product_id._id,
                                price: e.price,
                                qty: e.qty,
                                discount: e.discount,
                                subtotal: e.subtotal,
                                uom: e.uom
                            }
                        },
                        upsert: true
                    }
                }
                bulkOpt.push(obj)
            }
        }

        await OrderDetails.bulkWrite(bulkOpt)
       
        return NextResponse.json(body._id, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}