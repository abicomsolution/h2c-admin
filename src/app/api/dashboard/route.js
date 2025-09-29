import Member from "@/models/member";
import Earning from "@/models/earning";
import Code from "@/models/code";
import Wrequest from "@/models/wrequest";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import _ from 'lodash'

export const GET = async (request, context) => {  

    await connect();    

    let data = {
        member: 1,
        usedcodes: 0,
        unused_codes: 0,
        cd_codes: 0,    
        cd_usedcodes: 0,  
        cd_unusedcodes: 0,  
        tsales: 2,
        com_accumlated: 3,
        com_paid: 4,
        com_pending: 5,
        direct: 6,
        indirect: 7,
        ctp: 8,
        royalty: 9,
        unilevel: 10,
        tax: 11,
        adminfee: 12           
    }
  
    try {   

        data.member = await Member.countDocuments({activated: true, usertype: 0})
        data.usedcodes = await Code.countDocuments({status: 1, isCD: false})
        data.unused_codes = await Code.countDocuments({status: 0, isCD: false})
        data.cd_codes = await Code.countDocuments({isCD: true})
        data.cd_usedcodes = await Code.countDocuments({status: 1, isCD: true})
        data.cd_unusedcodes = await Code.countDocuments({status: 0, isCD: true})

        data.tsales =  data.usedcodes * 2800
       
        let earnings = await Earning.find()
        data.direct = _.sumBy(earnings, function(o){ return o.direct})
        data.indirect = _.sumBy(earnings, function(o){ return o.indirect})
        data.indirect = _.sumBy(earnings, function(o){ return o.indirect})
        data.ctp = _.sumBy(earnings, function(o){ return o.ctp})
        data.royalty = _.sumBy(earnings, function(o){ return o.royalty})
        data.unilevel = _.sumBy(earnings, function(o){ return o.unilevel})

        data.com_accumlated = _.sumBy(earnings, function(o){ return o.accumulated})

        let wrequests = await Wrequest.find()          

        let paid = _.filter(wrequests, function(o){ return o.status==1})
        let pending = _.filter(wrequests, function(o){ return o.status==0})

        data.com_paid = _.sumBy(paid, function(o){ return o.amount})
        data.com_pending = _.sumBy(pending, function(o){ return o.amount})
        data.tax = _.sumBy(paid, function(o){ return o.tax})
        data.adminfee = _.sumBy(paid, function(o){ return o.adminfee})

        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}