import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Provinces from "@/models/province";
import City from  "@/models/city";

export const POST = async (request) => {

    var body =  await request.json();

    // console.log(body)

    try {       

        await connect()    

        let params = {
           isHub: true,
           hubtype: body.hubtype,
           hub_province: body.province,           
           hub_city: body.hubtype!=2 ? body.citym : null  
        }

        console.log(body)

        let cProv = await Member.findOne({isHub: true, hubtype: 2, hub_province: body.province, activated:true})
        console.log("cProv", cProv)
        if (cProv){
            var _err = { name: "There is already an active provincial Hub for the selected province."};          
            return NextResponse.json(_err, { status: 500 });        
        }

        if (body.hubtype==0){
            let bHub = await Member.findOne({isHub: true, hubtype: 0, hub_city: body.citym, activated:true})
            if (bHub){
                var _err = { name: "There is already an active municipal Hub for the selected municipality."};          
                return NextResponse.json(_err, { status: 500 });        
            }
        }else  if (body.hubtype==1){
            let bHub = await Member.findOne({isHub: true, hubtype: 1, hub_city: body.citym, activated:true})
            if (bHub){
                var _err = { name: "There is already an active city Hub for the selected city."};          
                return NextResponse.json(_err, { status: 500 });        
            }
        }else  if (body.hubtype==2){           
            let bM = await Member.findOne({isHub: true, hubtype: 0, hub_province: body.province, activated:true})
            if (bM){
                var _err = { name: "There is already an active municipal Hub for the selected province."};          
                return NextResponse.json(_err, { status: 500 });        
            }

            let bC = await Member.findOne({isHub: true, hubtype: 1, hub_province: body.province, activated:true})
            if (bC){
                var _err = { name: "There is already an active city Hub for the province city."};          
                return NextResponse.json(_err, { status: 500 });        
            }

        }

        await Member.findByIdAndUpdate(body.id, params)
       
        return NextResponse.json({}, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}