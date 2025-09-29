import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import bcrypt from "bcryptjs";
import moment from 'moment'
import Munilevel from "@/models/munilevel";
import _ from 'lodash'

export const POST = async (request) => {

    var body =  await request.json();

    console.log(body)
    
    try {      

        await connect()    

        var level1 = []
        var level2 = []
        var level3 = []
        var level4 = []
        var level5 = []
        var level6 = []
        
        let header = await Member.findById(body.id, "fullname username fname mname lname rank photo_thumb rank isCd")

        level1 = await Munilevel.find({parent_id: body.id, level: 1}).populate("child_id", "fullname username fname mname lname rank photo_thumb isCd")

        var lv1_id = level1.map(o => o.child_id._id)
        level2 = await Munilevel.find({parent_id: {$in: lv1_id}, level: 1 }).populate("child_id", "fullname username fname mname lname rank photo_thumb isCd")

        var lv2_id = level2.map(o => o.child_id._id)
        level3 = await Munilevel.find({parent_id: {$in: lv2_id}, level: 1}).populate("child_id", "fullname username fname mname lname rank photo_thumb isCd")

        var lv3_id = level3.map(o => o.child_id._id)
        level4 = await Munilevel.find({parent_id: {$in: lv3_id}, level: 1}).populate("child_id", "fullname username fname mname lname rank photo_thumb isCd")

        var lv4_id = level4.map(o => o.child_id._id)
        level5 = await Munilevel.find({parent_id: {$in: lv4_id}, level: 1}).populate("child_id", "fullname username fname mname lname rank photo_thumb isCd")
    
        var data = {
            header: header,
            data: {
                lv1: level1,
                lv2: level2,
                lv3: level3,
                lv4: level4,
                lv5: level5                  
            }
            
        }
                                            
        return NextResponse.json(data, { status: 200 });           
    
    } catch (err) {
    
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    
    }
   
}