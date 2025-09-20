import Member from "@/models/member";
import PaymentMethod from  "@/models/payment_method";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const GET = async (request, context) => {  

    await connect();    

    try {   

        let data = await PaymentMethod.find()
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.log(err)
        return new NextResponse(err, {
            status: 500,
      });
    }

}