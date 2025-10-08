import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";
import MemberBeneficiary from "@/models/member_beneficiary";


export const POST = async (request) => {

    var body =  await request.json();    
    
    try {       

        await connect()    
                              
        let params = {
            member_id: body.id,
            otype: 0,
            beneficiary_relationship: body.relationship,
            beneficiary_fname: body.fname,
            beneficiary_mname: body.mname,
            beneficiary_lname: body.lname,            
            beneficiary_contact_no: body.contactno,
            beneficiary_birthdate: moment(body.birthdate).toDate(),
            beneficiary_address1: body.address1,            
            beneficiary_province: body.province._id,
            beneficiary_city: body.city._id,
            beneficiary_zipcode: body.zipcode  
        }
        
        let newBen = new MemberBeneficiary(params)
        await newBen.save()
        
        return NextResponse.json({}, { status: 200 });           
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}