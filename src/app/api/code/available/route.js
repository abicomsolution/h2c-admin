import Code from "@/models/code";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const PUT = async (request) => {
    
    var body =  await request.json();       
    
    console.log(body)
    
    try {    
    
        await connect();        

        const data =  await Code.find({status: body.status}).populate('sender_id');
        return NextResponse.json(data, { status: 200 });
    
    } catch (err) {
        console.log(err)   
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });    
    }

  };
  