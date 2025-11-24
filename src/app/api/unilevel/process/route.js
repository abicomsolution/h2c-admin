import Member from "@/models/member";
import MUnilevel from "@/models/monthly_unilevel";
import General from  "@/models/general";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Earning from '@/models/earning'
import EarningTransaction from "@/models/earning_transaction";
import { updateBalance } from "../../genealogy/activateFunc";
import moment from "moment";

export const POST = async (request) => {

    var body =  await request.json();    

    console.log(body)
    
    try {   

        await connect();    

        await processUnilevel(body)

        
        return NextResponse.json({}, { status: 200 });

    } catch (err) {
        console.log(err)
        return new NextResponse(err, {
            status: 500,
      });
    }

}



const processUnilevel = async (body)=>{

    const list = await MUnilevel.find({ nmonth: body.month, nyear: body.year, status: 0 }).populate('member_id')

    for (let detail of list){
        if (detail.personalsales>=600 && detail.unilevel>0){
            console.log(detail.member_id.fullname + " - " + detail.personalsales + " - " + detail.groupsales)
            await saveUnilevelTransaction(detail.member_id, detail.unilevel, body.month, body.year)         
            await MUnilevel.findByIdAndUpdate(detail._id, {status: 1, ispaid: 1})               
        }else{
            await MUnilevel.findByIdAndUpdate(detail._id, {status: 1, ispaid: 0})            
        }                
    }
}

const saveUnilevelTransaction = async (member, amount, month, year)=>{

    if (!member.activated){
        console.log("Not activated.")
        return false
    }

    let eheader = await Earning.findOne({member_id: member._id})
    if (!eheader){
        console.log("No header.")
        return false
    }

    try{

        let newData = [           
            {
                earning_id: eheader._id,
                transdate: moment().toDate(),
                earning_type: 4,
                amount: amount,
                net_amount: amount,            
                trans_type: 0,
                remarks: `Unilevel commission for ${month}/${year}`,
                from_member_id: null
            },
        ]

        console.log(newData)
        await EarningTransaction.insertMany(newData)        
        await updateBalance(eheader._id, member.rank)

    }catch(err){
        console.log(err)
        return false
    }   

}