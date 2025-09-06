import Member from "@/models/member";
import Code from "@/models/code";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const POST = async (request) => {

    var body =  await request.json();      
    try {       

        await connect()    

        var cn = '^' + body.recipient + '$';       
        let bFoundU =  await Member.findOne({ username: { $regex: new RegExp(cn, "i") }},'fullname username fname lname mname')    
        if (!bFoundU){
            var _err = { name: "Username does not exist in the system. Please choose another."};          
            return NextResponse.json(_err, { status: 500 });
        }

        let params = {
            status: 0,
            member_id: '68bbcda70b12e0477ccb75df'                
        }
        let bCodes = await Code.find(params).limit(parseInt(body.qty))
       
        if (parseInt(body.qty)>bCodes.length){
            var _err = { name: "Insufficient codes available." };
            return NextResponse.json(_err, { status: 500 });
        }

        if (bFoundU._id=="68bbcda70b12e0477ccb75df"){
            var _err = { name: "You cannot send codes to your own account." };
            return NextResponse.json(_err, { status: 500 });
        }


        return NextResponse.json(bFoundU, { status: 200 });                
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}
