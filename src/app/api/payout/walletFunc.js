import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Wallet from '@/models/wallet'
import WalletTrans from "@/models/wallet_transaction";
import moment from 'moment'
import Wrequest from "@/models/wrequest";
import _ from 'lodash'


export const updateWalletBalance = async (id, member_id)=>{

    var updateData = {
        accumulated : 0,
        withdrawal : 0,
        pending : 0,
        balance : 0
    }

    updateData.accumulated = await queryTransactions(id, 0)
    updateData.withdrawal = await queryTransactions(id, 1)

    let pendingRec = await Wrequest.find({member_id: member_id, status: 0})
    updateData.pending = _.sumBy(pendingRec, 'amount')

    updateData.balance =  updateData.accumulated - updateData.withdrawal
    if (updateData.balance<0){
        updateData.balance = 0
    }

    console.log(updateData)

    await Wallet.findByIdAndUpdate(id, updateData)
    
}

const queryTransactions = async (id, ctype)=>{

    let retAmount = 0

    try{
        let result = await WalletTrans.aggregate(
            [
                {
                    $match: { wallet_id: id, trans_type: ctype }
                },
                {
                    $group: {
                        _id: { pid: "$wallet_id", ptype: "$trans_type" },
                        total: { $sum: "$amount" }
                    }
                }
            ]
        )        
        if (!_.isEmpty(result)) {
            if (result.length > 0) {
                retAmount = result[0].total
                if (retAmount < 0) { retAmount = 0 }
            }
        }

        return retAmount;     

    } catch (err) {    
        console.log(err)   
        return 0
    }

}