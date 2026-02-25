import Member from "@/models/member";
import Wrequest from "@/models/wrequest";
import PaymentMethod from  "@/models/payment_method";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import moment from "moment";
import { updateWalletBalance, updateBalance } from "../walletFunc";
import Wallet from "@/models/wallet";
import WalletTrans from "@/models/wallet_transaction";
import BinaryEarning from "@/models/binary_earning";
import BinaryTrans from "@/models/binary_trans";


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


        let sponsor = await Member.findById(_member.sponsorid)
        if (sponsor && sponsor?.dragnet_activated){
            
            let eh = await BinaryEarning.findOne({member_id: sponsor._id})
            if (!eh){
                eh = new BinaryEarning({ member_id: sponsor._id})
                await eh.save()
            }

            let amount = (req.amount * 5) / 100
            let newBT = new BinaryTrans({
                earning_id: eh._id,
                transdate: moment().toDate(),
                earning_type: 4,
                amount: amount,
                net_amount: amount,                
                trans_type: 0,
                remarks: "",                
                from_member_id: _member._id     
            })
            await newBT.save()       
            
            await updateBalance(eh._id)
        }
               
        return NextResponse.json({}, { status: 200 });           
           
    } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}
