import Highlight from "@/models/highlight"
import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const POST = async (request) => {

    var body =  await request.json();

    try {       

        await connect()    

        await Highlight.findByIdAndDelete(body._id);

        return NextResponse.json({}, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}