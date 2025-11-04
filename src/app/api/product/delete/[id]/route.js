import Product from "@/models/product";
import ProductCategory from "@/models/product_category";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const GET = async (request, context) => {  
     
    const { params } = context;
     
    const { id } = await params;

  
    await connect();    

    try {   

        console.log("Deleting product with id:", id);

        await Product.findByIdAndDelete(id);
        return NextResponse.json({}, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}