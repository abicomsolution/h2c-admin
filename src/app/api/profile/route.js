import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Provinces from "@/models/province";
import City from  "@/models/city";
import Payment_method from "@/models/payment_method";
import MemberBeneficiary from "@/models/member_beneficiary";

export const POST = async (request) => {

    var body =  await request.json();

    console.log(body)
    
    try {       

        await connect()    

        let data = { profile: null, provinces: [], cities: [], pm: [], beneficiaries: [] }
       
        data.profile = await Member.findById(body.id)
                            .populate("province")
                            .populate("city")
                            .populate("paymethod")

        data.provinces = await Provinces.find()
        data.cities = await City.find()
        data.pm = await Payment_method.find()
        
        data.beneficiaries = await MemberBeneficiary.find({ member_id: body.id })
                                    .populate("beneficiary_province")
                                    .populate("beneficiary_city")


                       
        return NextResponse.json(data, { status: 200 });           
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}