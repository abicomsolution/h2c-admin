import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";
import MemberBeneficiary from "@/models/member_beneficiary";


export const POST = async (request) => {

    var body =  await request.json();    
    
    try {       

        await connect()    
                              
        await MemberBeneficiary.findByIdAndDelete(body.id)
        
        return NextResponse.json({}, { status: 200 });           
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}