import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Wallet from '@/models/wallet'
import WalletTrans from "@/models/wallet_transaction";
import moment from 'moment'
import Wrequest from "@/models/wrequest";
import _ from 'lodash'
import Binary from "@/models/binary";
import BinaryEarning from "@/models/binary_earning";
import BinaryTrans from "@/models/binary_trans";

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



export const updateBalance = async (id)=>{

    let updateData = {
        wallet: 0,
        direct: 0,
        doubledirect: 0,
        salesmatch: 0,
        performance: 0,
        stairstep: 0,
        breakaway: 0,
        hubroyalty: 0,

        wallet_withdrawn: 0,
        direct_withdrawn: 0,
        doubledirect_withdrawn: 0,
        salesmatch_withdrawn: 0,
        performance_withdrawn: 0,
        stairstep_withdrawn: 0,
        breakaway_withdrawn: 0,
        hubroyalty_withdrawn: 0,

        wallet_balance: 0,
        direct_balance: 0,
        doubledirect_balance: 0,
        salesmatch_balance: 0,
        performance_balance: 0,
        stairstep_balance: 0,
        breakaway_balance: 0,
        hubroyalty_balance: 0,

        accumulated: 0,    
        withdrawal: 0,
        balance: 0    
    }

    updateData.wallet = await queryTransactions(id, 0)
    updateData.direct = await queryTransactions(id, 1)    
    updateData.doubledirect = await queryTransactions(id, 2)
    updateData.salesmatch = await queryTransactions(id, 3)
    updateData.performance = await queryTransactions(id, 4)
    updateData.stairstep = await queryTransactions(id, 5)
    updateData.breakaway = await queryTransactions(id, 6)
    updateData.hubroyalty = await queryTransactions(id, 7)
    
    updateData.wallet_withdrawn = await queryTransactions(id, 10)
    updateData.direct_withdrawn = await queryTransactions(id, 11)
    updateData.doubledirect_withdrawn = await queryTransactions(id, 12)
    updateData.salesmatch_withdrawn = await queryTransactions(id, 13)
    updateData.performance_withdrawn = await queryTransactions(id, 14)
    updateData.stairstep_withdrawn = await queryTransactions(id, 15)
    updateData.breakaway_withdrawn = await queryTransactions(id, 16)
    updateData.hubroyalty_withdrawn = await queryTransactions(id, 17)


    updateData.wallet_balance = updateData.wallet - updateData.wallet_withdrawn
    if (updateData.wallet_balance<0){
        updateData.wallet_balance = 0
    }
    updateData.direct_balance = updateData.direct - updateData.direct_withdrawn
    if (updateData.direct_balance<0){
        updateData.direct_balance = 0
    }
    updateData.doubledirect_balance = updateData.doubledirect - updateData.doubledirect_withdrawn
    if (updateData.doubledirect_balance<0){
        updateData.doubledirect_balance = 0
    }
    updateData.salesmatch_balance = updateData.salesmatch - updateData.salesmatch_withdrawn
    if (updateData.salesmatch_balance<0){
        updateData.salesmatch_balance = 0
    }
    updateData.performance_balance = updateData.performance - updateData.performance_withdrawn
    if (updateData.performance_balance<0){
        updateData.performance_balance = 0
    }
    updateData.stairstep_balance = updateData.stairstep - updateData.stairstep_withdrawn
    if (updateData.stairstep_balance<0){
        updateData.stairstep_balance = 0
    }
    updateData.breakaway_balance = updateData.breakaway - updateData.breakaway_withdrawn
    if (updateData.breakaway_balance<0){
        updateData.breakaway_balance = 0
    }

    updateData.hubroyalty_balance = updateData.hubroyalty - updateData.hubroyalty_withdrawn
    if (updateData.hubroyalty_balance<0){
        updateData.hubroyalty_balance = 0
    }
    
    updateData.accumulated = updateData.wallet + updateData.direct + updateData.doubledirect + updateData.salesmatch + updateData.performance + updateData.stairstep + updateData.breakaway + updateData.hubroyalty
    updateData.withdrawal = updateData.wallet_withdrawn + updateData.direct_withdrawn + updateData.doubledirect_withdrawn + updateData.salesmatch_withdrawn + updateData.performance_withdrawn + updateData.stairstep_withdrawn + updateData.breakaway_withdrawn + updateData.hubroyalty_withdrawn
    updateData.balance = updateData.accumulated - updateData.withdrawal
    if (updateData.balance<0){
        updateData.balance = 0
    }
      
    await BinaryEarning.findByIdAndUpdate(id, updateData)
}


const queryBinTransactions = async (id, ctype)=>{

    let retAmount = 0

    try{
        let result = await BinaryTrans.aggregate(
            [
                {
                    $match: { earning_id: id, earning_type: ctype }
                },
                {
                    $group: {
                        _id: { pid: "$earning_id", ptype: "$earning_type" },
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
