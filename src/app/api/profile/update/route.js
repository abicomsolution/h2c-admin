import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

import { 
    S3Client,
    PutObjectCommand,    
} from "@aws-sdk/client-s3";
  
import { v4 as uuidv4 } from 'uuid';
import sharp from "sharp";
import moment from "moment";

const S3BUCKET = process.env.AWS_BUCKET


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});



export const POST = async (request) => {

    var body =  await request.json();

    console.log(body)

    try {       

        await connect()    

        var cn = '^' +   body.email + '$';       
        let bFoundU =  await Member.findOne({ emailadd: { $regex: new RegExp(cn, "i") }, _id: {$ne: body.id}})    
        if (bFoundU){
            var _err = { name: "Email is already taken. Please choose another."};          
            return NextResponse.json(_err, { status: 500 });
        }

        // cn = '^' +   body.contactno + '$';       
        // bFoundU =  await Member.findOne({ mobile1: { $regex: new RegExp(cn, "i") }, _id: {$ne: body.id}})    
        // if (bFoundU){
        //     var _err = { name: "Contact number is already taken. Please choose another."};          
        //     return NextResponse.json(_err, { status: 500 });
        // }
                       

        let params = {
            fname: body.fname,
            mname: body.mname,
            lname: body.lname,
            emailadd: body.email,
            mobile1: body.contactno,   
            birthdate: moment(body.birthdate).toDate(),
            fullname: body.fname + " " + body.mname + " " + body.lname            
        }
        
        await Member.findByIdAndUpdate(body.id, params)

        if(body.photo){
            var base64Image = Buffer.from(body.photo.path.replace(/^data:image\/\w+;base64,/, ""), 'base64')
            var buf = Buffer.from(base64Image, 'binary');      
            var resz = await sharp(buf).resize({width: 150, height: 150, fit: 'cover'}).toFormat('webp').toBuffer()
            var key = uuidv4() + ".webp"             
            await s3.send(new PutObjectCommand({Bucket: S3BUCKET, Key: key, Body: resz}))    
            const url = process.env.AWS_BUCKET_URL + key
            console.log(url)
            await Member.findByIdAndUpdate(body.id, {photo_thumb: url})         
        }
        
        return NextResponse.json({}, { status: 200 });           
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}