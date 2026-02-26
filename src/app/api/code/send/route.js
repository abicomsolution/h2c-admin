import Member from "@/models/member";
import Code from "@/models/code";
import CodeHistory from "@/models/code_history"
import { NextResponse } from "next/server";
import connect from "@/utils/db";
const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();

export const POST = async (request) => {

    var body =  await request.json();    

    console.log(body)

    try {       

        await connect()    
    
        let params = {     
            status: 0,
            member_id: '68bbcda70b12e0477ccb75df',
            codetype: body.codetype ?? 0,
            isCD: body.isCD ?? false,
            isFS: body.isFS ?? false
        }
        let bCodes = await Code.find(params).limit(parseInt(body.qty))        
        if (parseInt(body.qty)>bCodes.length){
            var _err = { name: "Insufficient codes available." };
            return NextResponse.json(_err, { status: 500 });
        }

        let bErr = await send(body, bCodes)
        if (bErr){
            var _err = { name: bErr};          
            return NextResponse.json(_err, { status: 500 });
        }else{
            return NextResponse.json({}, { status: 200 });           
        }        

        
    } catch (err) {
       return err.name
    }
   
}




const send = async (body, codes)=>{

    try {   
        const options = {
            upperCaseAlpha: true,
            number: true,
            specialCharacter: false,
            minimumLength: 8,
            maximumLength: 8,
            exactLength: 8
        };

        let batch_id = passwordGenerator.generatePassword(options);
        batch_id = batch_id.toUpperCase();

        for (const e of codes) {
            let param = {
                datetime_sent: new Date(),
                member_id: body.recipient,
                sender_id: "68bbcda70b12e0477ccb75df"            
            };

            await Code.findByIdAndUpdate(e._id, param);

             const hdata = [
                    {
                        transtype: 0, // send
                        member_id: "68bbcda70b12e0477ccb75df" ,                        
                        receiver_id: body.recipient,
                        code_id: e._id,
                        date_sent: param.datetime_sent,
                        time_sent: param.datetime_sent,
                        batch_id: batch_id
                    },
                    {
                        transtype: 1, // received
                        member_id:  body.recipient,
                        receiver_id: "68bbcda70b12e0477ccb75df",
                        code_id: e._id,
                        date_sent: param.datetime_sent,
                        time_sent: param.datetime_sent,
                        batch_id: batch_id
                    }
                ];
            
            await CodeHistory.insertMany(hdata);

            // const hdata = {
            //     member_id: "68bbcda70b12e0477ccb75df",
            //     receiver_id: body.recipient,
            //     code_id: e._id,
            //     date_sent: param.datetime_sent,
            //     time_sent: param.datetime_sent,
            //     batch_id: batch_id
            // };

            // const newHistory = new CodeHistory(hdata);
            // await newHistory.save();
        }

    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return _err        
    }
}