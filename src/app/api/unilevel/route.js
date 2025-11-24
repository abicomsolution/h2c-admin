import Member from "@/models/member";
import MUnilevel from "@/models/monthly_unilevel";
import General from  "@/models/general";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const POST = async (request) => {

    var body =  await request.json();    

    console.log(body)
    
    try {   

        await connect();    

        let data = await MUnilevel.find({ nmonth: body.month, nyear: body.year }).populate({ path: 'member_id', select: '_id fullname username fname lname' })
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.log(err)
        return new NextResponse(err, {
            status: 500,
      });
    }

}