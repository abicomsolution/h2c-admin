import Member from "@/models/member";
import Wrequest from "@/models/wrequest";
import PaymentMethod from  "@/models/payment_method";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";
import { updateWalletBalance } from "../walletFunc";
import Wallet from "@/models/wallet";
import WalletTrans from "@/models/wallet_transaction";


export const POST = async (request) => {

    var body =  await request.json();    

    console.log(body)

    try {       

        await connect()    

        let req = await Wrequest.findById(body.id)

        let _member = await Member.findById(req.member_id)

        let _wallet = await Wallet.findOne({member_id: _member._id})        

        let newT = {
            wallet_id: _wallet._id,
            transdate: moment().toDate(),
            trans_type: 1,
            income_type: 0,
            amount: req.amount      
        }        

        let newWT = new WalletTrans(newT)
        await newWT.save()

        await Wrequest.findByIdAndUpdate(body.id, {status: 1, process_date:moment().toDate()})

        await updateWalletBalance(_wallet._id, _member._id)
       
       
        return NextResponse.json({}, { status: 200 });           
           
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}
