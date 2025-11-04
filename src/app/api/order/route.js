import Orders from "@/models/order_header";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const GET = async (request, context) => {  

    await connect();    

    try {   

        let data = await Orders.find().populate('member_id').sort({ transdate: -1 })
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}