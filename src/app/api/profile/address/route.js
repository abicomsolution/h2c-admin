import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const POST = async (request) => {

    var body =  await request.json();

    // console.log(body)

    try {       

        await connect()    

        let params = {
            address1: body.address1,
            address2: body.address2,
            province: body.province._id,
            city: body.city._id,
            zipcode: body.zipcode            
        }
        
        await Member.findByIdAndUpdate(body.id, params)
       
        return NextResponse.json({}, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}