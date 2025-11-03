import Product from "@/models/product";
import ProductCategory from "@/models/product_category";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const GET = async (request, context) => {  
     
    const { params } = context;
     
    const { id } = await params;

  
    await connect();    

    try {   

        let data = { categories: [], product: null }
        data.categories = await ProductCategory.find()
        if (id && id != 'add'){
          data.product = await Product.findById(id).populate('category_id');
        }          
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}