import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import bcrypt from "bcryptjs";

export const POST = async (request) => {

    var body =  await request.json();

   

    try {       

        await connect()   
        
        const hashedPassword = await bcrypt.hash(body.password, 5);

        let params = {
            plain_pwd: body.password,            
            pwd: hashedPassword
        }
        
        await Member.findByIdAndUpdate(body.id, params)
       
        return NextResponse.json({}, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}