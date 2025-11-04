import Product from "@/models/product";
import Orders from "@/models/order_header";
import OrderDetails from "@/models/order_details";
import Provinces from "@/models/province";
import City from  "@/models/city";
import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const GET = async (request, context) => {  
     
    const { params } = context;
     
    const { id } = await params;

  
    await connect();    

    try {   

        let data = { members: [], products: [], order: null, details: [] }        
        data.members = await  Member.find({}, "fname lname mname fullname username sponsorid account_type address1 address2 city province userid activated isHub hubtype")
                                    .populate({ path: "sponsorid", select: "fullname" })
                                    .populate({ path: "province" })
                                    .populate({ path: "city" })
                                    .collation({ locale: "en" })
                                    .sort({ fullname: 1 })

        data.products = await   Product.find({ isActive: true }).collation({ locale: "en" }).sort({ productname: 1 })        
        if (id && id != 'add'){
            data.order = await Orders.findById(id).populate({path: 'member_id', populate: { path: "sponsorid", select: "fullname" }})
            data.details = await  OrderDetails.find({ order_header_id: data.order._id })
                                .populate({ path: "product_id", select: "productname price member_price hub_price uom" })
        }     
             
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}