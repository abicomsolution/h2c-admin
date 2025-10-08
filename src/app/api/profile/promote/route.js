import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const POST = async (request) => {

    var body =  await request.json();

    // console.log(body)

    try {       

        await connect()    

        let params = {
           isHub: true,
           hubtype: body.hubtype  
        }
        
        await Member.findByIdAndUpdate(body.id, params)
       
        return NextResponse.json({}, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}