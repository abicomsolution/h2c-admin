import Orders from "@/models/order_header";
import OrderDetails from "@/models/order_details";
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
   
        await Orders.findByIdAndUpdate(body._id, { status: 1 })

        return NextResponse.json(body._id, { status: 200 });

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}