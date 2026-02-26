import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Earning from "@/models/earning";
import EarningTrans from "@/models/earning_transaction";
import moment from "moment";

import Binary from "@/models/binary";
import BinaryEarning from "@/models/binary_earning";
import BinaryTrans from "@/models/binary_trans";


export const POST = async (request) => {

    var body =  await request.json();

    console.log("Search request body:", body);

    await connect();    

    try {   

        var dateFrom = new Date(moment(body.dateFrom).format("YYYY-MM-DD") + ' 00:00:00')
        var dateTo = new Date(moment(body.dateTo).format("YYYY-MM-DD") + ' 23:59:59')

        let et =[0,1,2,3,4,5,6,7]       
        var params = {
            transdate: { $gte: dateFrom, $lte: dateTo },
            earning_type: { $in: et }
         }

        if (body.selectCat.value >=0){
            params = {
                transdate: { $gte: dateFrom, $lte: dateTo },
                earning_type: body.selectCat.value
            }
        }


        let aggregatePipeline = [
            {
                "$match": params
            },
            {
                '$lookup': {
                    'from': 'binary_earnings',
                    'localField': 'earning_id',
                    'foreignField': '_id',
                    'as': 'earning_id'
                },
            },
            {
                $unwind: {
                    path: "$earning_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                '$lookup': {
                    'from': 'members',
                    'localField': 'earning_id.member_id',
                    'foreignField': '_id',
                    'as': 'earning_id.member_id'
                },
            },
            {
                $unwind: {
                    path: "$earning_id.member_id",
                    preserveNullAndEmptyArrays: true
                }
            },          
            {
                '$lookup': {
                    'from': 'members',
                    'localField': 'from_member_id',
                    'foreignField': '_id',
                    'as': 'from_member_id'
                },
            },
            {
                $unwind: {
                    path: "$from_member_id",
                    preserveNullAndEmptyArrays: true
                }
            },           
            {
                '$match':{
                    "earning_id.member_id.fullname": { $regex: new RegExp(body.search, "i") }
                }
            }
        ]

        let data = await BinaryTrans.aggregate(aggregatePipeline).sort({transdate:-1}).allowDiskUse(true)
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}