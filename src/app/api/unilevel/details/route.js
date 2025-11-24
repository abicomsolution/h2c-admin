import Member from "@/models/member";
import Order from "@/models/order_header";
import Purchase from "@/models/purchases";
import MUnilevel from "@/models/monthly_unilevel";
import MUDetails from "@/models/monthly_unilevel_detail";
import General from  "@/models/general";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const POST = async (request) => {

    var body =  await request.json();    

    console.log(body)
    
    try {   

        await connect();    

        let data = await MUDetails.find({ monthly_unilevel_id: body.id })
                                    .populate({ path: 'order_id' })
                                    .populate({
                                        path: 'purchase_id',
                                        model: 'purchase',
                                        populate: { path: 'member_id', select: 'fname lname fullname' }
                                    })
                                    .sort({ transdate: -1 })
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.log(err)
        return new NextResponse(err, {
            status: 500,
      });
    }

}