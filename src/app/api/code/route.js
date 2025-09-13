import Member from "@/models/member";
import Code from "@/models/code";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();

export const POST = async (request) => {

    var body =  await request.json();    

    try {       

        await connect()    
       
        let bErr = await generate(parseInt(body.qty), body.isCD);
        if (bErr){
            var _err = { name: bErr};          
            return NextResponse.json(_err, { status: 500 });
        }else{
            return NextResponse.json([], { status: 200 });           
        }        
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}


const generate = async (quantity, isCD)=>{

    try {      

        const options = {
            upperCaseAlpha: true,
            number: true,
            specialCharacter: false,
            minimumLength: 10,
            maximumLength: 12,
            exactLength: 12
        };
      
        for (let i = 0; i < quantity; i++) {
            let codenum;
            let isUnique = false;
            // Try generating a unique code
            while (!isUnique) {
                codenum = passwordGenerator.generatePassword(options).toUpperCase();
                const exists = await Code.findOne({ codenum: { $regex: new RegExp('^' + codenum + '$', "i") } });
                if (!exists) {
                    isUnique = true;
                }
            }
            const mdata = {
                date_created: new Date(),
                time_created: new Date(),
                datetime_sent: new Date(),
                member_id: '68bbcda70b12e0477ccb75df',
                sender_id: '68bbcda70b12e0477ccb75df',
                datetime_used: null,
                codenum: codenum,
                status: 0,    
                isCD: isCD,  
                codetype: 0,   
            };
            console.log(mdata)
            const newCode = new Code(mdata);
            await newCode.save();      
        }           
    }catch(err){
        return err
    }

}
