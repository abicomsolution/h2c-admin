import Member from "@/models/member";
import Wrequest from "@/models/wrequest";
import PaymentMethod from  "@/models/payment_method";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";

export const POST = async (request) => {

    var body =  await request.json();    

    console.log(body)

    try {       

        await connect()    

        await Wrequest.findByIdAndUpdate(body.id, {status: 2, process_date:moment().toDate()})
       
        return NextResponse.json({}, { status: 200 });           
           
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}
