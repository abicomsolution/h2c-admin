import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Provinces from "@/models/province";
import City from  "@/models/city";

import Jcities from "@/utils/cities.json";

export const GET = async (request, context) => {  
       
    try {       

        await connect()    

        let ctr = 0
        let foundCtr = 0

        await City.updateMany({city: null}, { city: 0 });

        await Promise.all(Jcities.map(async (cityData) => {                  
            ctr+=1;
            var cn = '^' +   cityData.name.trim() + '$';  
          
            let cityDoc = await City.findOne({ label: { $regex: new RegExp(cn, "i") }})                    
            if (cityDoc){
                foundCtr+=1;             
                console.log(cityDoc?.label + " - " + cityDoc?.city)   
                await City.updateOne( { _id: cityDoc._id }, { city: 1 } );
                // if (!cityDoc?.city){
                //     console.log(cityDoc.label + " - " + cityDoc.province)
                // }
            }else {
                // console.log("City not found: ", cityData.name)
            }
            
        
        }));

        console.log("Total cities: ", ctr)
        console.log("Found cities: ", foundCtr)

        return NextResponse.json({}, { status: 200 });
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}