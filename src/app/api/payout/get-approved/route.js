import Member from "@/models/member";
import Wrequest from "@/models/wrequest";
import PaymentMethod from  "@/models/payment_method";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";

export const POST = async (request) => {

    var body =  await request.json();    

    console.log(body)

    try {       

        await connect()    

        var dateFrom = moment(body.dateFrom).startOf("day").toDate()
        var dateTo = moment(body.dateTo).endOf("day").toDate()

        let data = await Wrequest.find({status: 1, transdate: {$gte: dateFrom, $lte: dateTo}})
                        .populate({path:'member_id', select: 'username fullname'})
                        .populate('paymethod')
                  
    
        return NextResponse.json(data, { status: 200 });           
           
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}
