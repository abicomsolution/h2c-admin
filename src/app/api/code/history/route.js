import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from 'moment'
import Code from '@/models/code'
import CodeHistory from '@/models/code_history'
import _ from 'lodash'

export const POST = async (request) => {

    var body =  await request.json();
     
    try {       

        await connect()         

        let data = await CodeHistory.find({member_id: "68bbcda70b12e0477ccb75df"})
                                    .populate({path: "receiver_id", select: "fullname username"})
                                    .populate({path: "code_id"})
                                    .sort({time_sent: -1})
                                    .lean()     

        var grouped = _.groupBy(data,(o)=>{return o.batch_id})
        let summary = [];
        for (const key of Object.keys(grouped)) {
            let obj = {
                ...grouped[key][0],
                count: grouped[key].length
            };
            summary.push(obj);
        }
                      
        return NextResponse.json(summary, { status: 200 });           
     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}