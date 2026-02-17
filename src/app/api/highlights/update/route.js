import Highlights from "@/models/highlight";
import HighlightPhoto from "@/models/highlight_photo";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";
import mongoose from "mongoose";


import { 
    S3Client,
    PutObjectCommand,    
} from "@aws-sdk/client-s3";
  
import { v4 as uuidv4 } from 'uuid';
import sharp from "sharp";

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

    
    await connect()    

    const session = await mongoose.startSession();

    try {       

        session.startTransaction();
      
        let updateData ={           
            headline: body.headline,
            content: body.content,	
            ctype: body.ctype,
            videourl: body.videourl
        }

        await Highlights.findByIdAndUpdate(body._id, updateData);

        var photosToDelete = [];
        body.photos.forEach(el => {
            if (el.onDelete === true){
                photosToDelete.push(el._id);
            }            
        });

        if (photosToDelete.length > 0){
            await Highlights.findByIdAndUpdate(body._id, { $pull: { photos: { $in: photosToDelete } } });
            await HighlightPhoto.deleteMany({ _id: { $in: photosToDelete } });
        }

        var newPhoto_ids = []              
        const url = process.env.AWS_BUCKET_URL

        if (body.ctype==1){
            
            await Promise.all(            
                body.photos.map(async(photo)=>{
                    if(photo.onInsert){
                        var base64Image = Buffer.from(photo.path.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                        var buf = Buffer.from(base64Image, 'binary');            
                        var resz = await sharp(buf).resize({width: 800, fit: 'cover'}).toFormat('webp').toBuffer()
                        var key = "product_photos/" + uuidv4() + ".png"              
                        await s3.send(new PutObjectCommand({Bucket: S3BUCKET, Key: key, Body: resz}))       

                        // thumbnails
                        var rest = await sharp(buf).resize({ height: 128, fit: 'cover'}).toFormat('webp').toBuffer()
                        var keyT = "thumbnails/" + uuidv4() + ".webp"              
                        await s3.send(new PutObjectCommand({Bucket: S3BUCKET, Key: keyT, Body: rest}))       

                        var newObj = { key: key, path: url + key, thumbnailkey: keyT, thumbnailurl: url + keyT}            
                        let newP = await HighlightPhoto.create({ ...newObj})                
                        newPhoto_ids.push(newP._id)

                        await Highlights.findByIdAndUpdate(body._id, { $push: { photos: newP._id } })
                    }              
                })
            )         
        }    
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json(body._id, { status: 200 });    

     } catch (err) {
        await session.abortTransaction();
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}