import Member from "@/models/member";
import PaymentMethod from  "@/models/payment_method";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const POST = async (request) => {

    var body =  await request.json();    

    try {       

        await connect()    

        let params = {
            name: body.name,
            tpe: body.tpe,
            status: body.status
        }

        let newPm = new PaymentMethod(params)
       
        await newPm.save() 
        
        return NextResponse.json({}, { status: 200 });           
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}
