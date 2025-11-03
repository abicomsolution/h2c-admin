import Product from "@/models/product";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

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


    try {       

        await connect()    

        let params = {
            category_id: body.category_id._id,
            code: body.code,
            productname: body.productname,    
            description: body.description,            
            uom: body.uom,
            weight: body.weight || 0,
            price: body.price || 0,
            member_price: body.member_price || 0,
            hub_price: body.hub_price || 0,
            hub_profit: body.hub_profit || 0,
            h2c_wallet: body.h2c_wallet || '',
            stairstep_alloc: body.stairstep_alloc || '',
            unilevel_alloc: body.unilevel_alloc || 0,    
            photo_thumb: '',
            isMembership: body.isMembership,
            isProdPackage: body.isProdPackage,    
            isActive: body.isActive,            
            unit_cost: body.unit_cost || 0,
            min_stock_level: body.min_stock_level || 0,
            isNonInventory: body.isNonInventory,
            isHidden: body.isHidden	
        }

        let newProduct = new Product(params)
        let savedProduct = await newProduct.save()

        if(body.photo){
            var base64Image = Buffer.from(body.photo.path.replace(/^data:image\/\w+;base64,/, ""), 'base64')
            var buf = Buffer.from(base64Image, 'binary');      
            var resz = await sharp(buf).resize({width: 150, height: 150, fit: 'cover'}).toFormat('webp').toBuffer()
            var key = uuidv4() + ".webp"             
            await s3.send(new PutObjectCommand({Bucket: S3BUCKET, Key: key, Body: resz}))    
            const url = process.env.AWS_BUCKET_URL + key
            console.log(url)
            await Product.findByIdAndUpdate(savedProduct._id, {photo_thumb: url})         
        }
        
        // await Member.findByIdAndUpdate(body.id, params)
       
        return NextResponse.json(savedProduct._id, { status: 200 });    

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}