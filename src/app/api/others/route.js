import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Provinces from "@/models/province";
import City from  "@/models/city";

export const GET = async (request, context) => {  
       
    try {       

        await connect()    

        let data = { provinces: [], cities: [] }
               
        data.provinces = await Provinces.find()
        data.cities = await City.find()       
                       
        return NextResponse.json(data, { status: 200 });           
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}