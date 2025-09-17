import Member from "@/models/member";
import General from  "@/models/general";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const POST = async (request) => {

    var body =  await request.json();    

    try {       

        await connect()    

        let params = {
            minimum_withdrawal: Number(body.minimum_withdrawal),
            admin_fee: Number(body.admin_fee),
            is_admin_fee_percent: body.is_admin_fee_percent,
            is_tax_percent: body.is_tax_percent,
            tax: body.tax,
            payout_sched: body.payout_sched
        }
       
        await General.findOneAndUpdate({}, params)        
        
        return NextResponse.json({}, { status: 200 });           
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}
