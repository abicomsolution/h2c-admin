import Product from "@/models/product";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const GET = async (request, context) => {  

    await connect();    

    try {   

        let data = await Product.find()
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}