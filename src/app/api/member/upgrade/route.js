import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import { activate } from "../../genealogy/activateFunc";
import MemberBeneficiary from "@/models/member_beneficiary";

export const POST = async (request) => {

    var body =  await request.json();

    try {       
    
        await connect()    

        let bMember = await Member.findById(body.id)
        if (!bMember){
            var _err = { name: "Member not found."};          
            return NextResponse.json(_err, { status: 500 });        
        }else if (bMember.address1=='' || bMember.province==null || bMember.city==null || bMember.zipcode==''){
            var _err = { name: "Please complete member address/province/city/zipcode in your profile."};          
            return NextResponse.json(_err, { status: 500 });        
        }



        let cMB = await MemberBeneficiary.countDocuments({ member_id: body.id })
        if (cMB==0){
            var _err = { name: "Please add at least one beneficiary customer profile."};          
            return NextResponse.json(_err, { status: 500 });        
        }


        await activate(body.id)

        return NextResponse.json({}, { status: 200 });         
    
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }

}