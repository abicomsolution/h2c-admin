import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Provinces from "@/models/province";
import City from  "@/models/city";

export const POST = async (request) => {
       
    try {       

        await connect()    

        const body = await request.json()

        console.log(body)
        
        let data = { provinces: [], cities: [] }
                       
        data.provinces = await Provinces.find()      
               
        if (body.type==1){
            data.cities = await City.find({city: 1})    
        }else if (body.type==0){
            data.cities = await City.find({city: 0})    
        }
                             
        return NextResponse.json(data, { status: 200 });           
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}