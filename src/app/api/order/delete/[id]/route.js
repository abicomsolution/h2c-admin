import Orders from "@/models/order_header";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import OrderDetails from "@/models/order_details";

export const GET = async (request, context) => {  
     
    const { params } = context;
     
    const { id } = await params;

  
    await connect();    

    try {   

        console.log("Deleting order with id:", id);

        await Orders.findByIdAndDelete(id);

        await OrderDetails.deleteMany({ order_header_id: id });
        
        return NextResponse.json({}, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}