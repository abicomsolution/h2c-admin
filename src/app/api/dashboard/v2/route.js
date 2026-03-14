import Member from "@/models/member";
import BinaryEarning from "@/models/binary_earning";
import BinaryTrans from "@/models/binary_trans";
import Binary from "@/models/binary";
import Code from "@/models/code";
import Wrequest from "@/models/wrequest";
import { NextResponse } from "next/server";
import connect from "@/utils/db";
import _ from 'lodash'
import { BINARY_PKG } from "@/utils/constants";

export const GET = async (request, context) => {  

    await connect();    

    const { searchParams } = new URL(request.url)
    const filterMonth = searchParams.get('month') ? parseInt(searchParams.get('month')) : null
    const filterYear = searchParams.get('year') ? parseInt(searchParams.get('year')) : null

    let dateFilter = null
    if (filterYear && filterMonth) {
        const start = new Date(filterYear, filterMonth - 1, 1)
        const end = new Date(filterYear, filterMonth, 1)
        dateFilter = { $gte: start, $lt: end }
    } else if (filterYear) {
        const start = new Date(filterYear, 0, 1)
        const end = new Date(filterYear + 1, 0, 1)
        dateFilter = { $gte: start, $lt: end }
    }

    const priceMap = {}
    BINARY_PKG.forEach(p => { priceMap[p.codetype] = p.price })

    let data = {
        total_members: 0,
        total_sales: 0,
        total_binary_earnings: 0,
        pending_withdrawal: 0,
        v2_activated: 0,
        v1_activated: 0,
        accttype_breakdown: [],
        codes_by_type: [],
        total_codes: 0,
        total_used: 0,
        total_unused: 0,
        paid_count: 0,
        cd_count: 0,
        fs_count: 0,
        direct: 0,
        doubledirect: 0,
        salesmatch: 0,
        performance: 0,
        stairstep: 0,
        breakaway: 0,
        hubroyalty: 0,
        accumulated: 0,
        withdrawn: 0,
        balance: 0,
        com_paid: 0,
        com_pending: 0,
        tax: 0,
        adminfee: 0,
        monthly_trend: [],
        top_earners: []
    }
  
    try {   

        // V2 binary slots (codetype > 0)
        const binaryQuery = { codetype: { $gt: 0 } }
        if (dateFilter) binaryQuery.transdate = dateFilter
        data.total_members = await Binary.countDocuments(binaryQuery)

        // Member activation counts
        const v2MemberQuery = { dragnet_activated: true }
        const v1MemberQuery = { activated: true }
        if (dateFilter) {
            v2MemberQuery.dragnet_date_activated = dateFilter
            v1MemberQuery.date_time_activated = dateFilter
        }
        data.v2_activated = await Member.countDocuments(v2MemberQuery)
        data.v1_activated = await Member.countDocuments(v1MemberQuery)

        // 2.0 Account type breakdown
        const acctTypes = BINARY_PKG.filter(p => p.codetype > 0)
        data.accttype_breakdown = await Promise.all(acctTypes.map(async (at) => {
            const q = { dragnet_activated: true, dragnet_accounttype: at.codetype }
            if (dateFilter) q.dragnet_date_activated = dateFilter
            const count = await Member.countDocuments(q)
            return { codetype: at.codetype, label: at.name, count }
        }))

        // Code breakdown by codetype (1-5) with sales from BINARY_PKG prices
        const codeTypes = BINARY_PKG.filter(p => p.codetype > 0)
        let totalSales = 0

        const codeBreakdown = await Promise.all(codeTypes.map(async (ct) => {
            const baseQ = { codetype: ct.codetype }
            if (dateFilter) baseQ.datetime_used = dateFilter
            const used = await Code.countDocuments({ ...baseQ, status: 1 })
            const unusedQ = { codetype: ct.codetype, status: 0 }
            if (dateFilter) unusedQ.date_created = dateFilter
            const unused = await Code.countDocuments(unusedQ)
            const paid_used = await Code.countDocuments({ ...baseQ, status: 1, isCD: false, isFS: false })
            const cd_used = await Code.countDocuments({ ...baseQ, status: 1, isCD: true })
            const fs_used = await Code.countDocuments({ ...baseQ, status: 1, isFS: true })
            const total = used + unused
            const sales = paid_used * ct.price
            totalSales += sales
            return {
                codetype: ct.codetype,
                label: ct.name,
                price: ct.price,
                used,
                unused,
                total,
                paid_used,
                cd_used,
                fs_used,
                sales,
                usage: total > 0 ? Math.round((used / total) * 100) : 0
            }
        }))

        data.codes_by_type = codeBreakdown
        data.total_codes = _.sumBy(codeBreakdown, 'total')
        data.total_used = _.sumBy(codeBreakdown, 'used')
        data.total_unused = _.sumBy(codeBreakdown, 'unused')
        data.paid_count = _.sumBy(codeBreakdown, 'paid_used')
        data.cd_count = _.sumBy(codeBreakdown, 'cd_used')
        data.fs_count = _.sumBy(codeBreakdown, 'fs_used')
        data.total_sales = totalSales

        // Binary earnings aggregation (binary_earning is cumulative, use binary_trans for filtered period)
        let bEarnings
        if (dateFilter) {
            // When filtered, sum from binary_trans within the date range
            const transAgg = await BinaryTrans.aggregate([
                { $match: { transdate: dateFilter, earning_type: { $lte: 7 } } },
                { $group: {
                    _id: "$earning_type",
                    total: { $sum: "$amount" }
                }}
            ])
            const transMap = {}
            transAgg.forEach(t => { transMap[t._id] = t.total })
            data.direct = transMap[1] || 0
            data.doubledirect = transMap[2] || 0
            data.salesmatch = transMap[3] || 0
            data.performance = transMap[4] || 0
            data.stairstep = transMap[5] || 0
            data.breakaway = transMap[6] || 0
            data.hubroyalty = transMap[7] || 0
            data.accumulated = Object.values(transMap).reduce((s, v) => s + v, 0)
            data.total_binary_earnings = data.accumulated

            // Withdrawals for filtered period
            const filteredW = await BinaryTrans.aggregate([
                { $match: { transdate: dateFilter, earning_type: { $gte: 10, $lte: 17 } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
            data.withdrawn = filteredW.length > 0 ? filteredW[0].total : 0
            data.balance = data.accumulated - data.withdrawn
        } else {
            bEarnings = await BinaryEarning.find()
        data.direct = _.sumBy(bEarnings, o => o.direct || 0)
        data.doubledirect = _.sumBy(bEarnings, o => o.doubledirect || 0)
        data.salesmatch = _.sumBy(bEarnings, o => o.salesmatch || 0)
        data.performance = _.sumBy(bEarnings, o => o.performance || 0)
        data.stairstep = _.sumBy(bEarnings, o => o.stairstep || 0)
        data.breakaway = _.sumBy(bEarnings, o => o.breakaway || 0)
        data.hubroyalty = _.sumBy(bEarnings, o => o.hubroyalty || 0)
        data.accumulated = _.sumBy(bEarnings, o => o.accumulated || 0)
        data.withdrawn = _.sumBy(bEarnings, o => o.withdrawal || 0)
        data.balance = _.sumBy(bEarnings, o => o.balance || 0)
        data.total_binary_earnings = data.accumulated
        }

        // Withdrawal requests
        const wQuery = dateFilter ? { transdate: dateFilter } : {}
        const wrequests = await Wrequest.find(wQuery)
        const paid = wrequests.filter(o => o.status === 1)
        const pending = wrequests.filter(o => o.status === 0)
        data.com_paid = _.sumBy(paid, o => o.amount || 0)
        data.com_pending = _.sumBy(pending, o => o.amount || 0)
        data.pending_withdrawal = data.com_pending
        data.tax = _.sumBy(paid, o => o.tax || 0)
        data.adminfee = _.sumBy(paid, o => o.adminfee || 0)

        // Monthly trend (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        sixMonthsAgo.setDate(1)
        sixMonthsAgo.setHours(0, 0, 0, 0)

        const monthlyAgg = await BinaryTrans.aggregate([
            { $match: { transdate: { $gte: sixMonthsAgo }, earning_type: { $lte: 7 } } },
            { $group: { 
                _id: { year: { $year: "$transdate" }, month: { $month: "$transdate" } }, 
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        data.monthly_trend = monthlyAgg.map(m => ({
            label: `${monthNames[m._id.month]} ${m._id.year}`,
            total: m.total,
            count: m.count
        }))

        // Top 10 earners
        if (dateFilter) {
            const topAgg = await BinaryTrans.aggregate([
                { $match: { transdate: dateFilter, earning_type: { $lte: 7 } } },
                { $group: { _id: "$earning_id", total: { $sum: "$amount" } } },
                { $sort: { total: -1 } },
                { $limit: 10 }
            ])
            const earningIds = topAgg.map(t => t._id)
            const earningDocs = await BinaryEarning.find({ _id: { $in: earningIds } })
                .populate({ path: 'member_id', select: 'fullname username' })
            const earningMap = {}
            earningDocs.forEach(e => { earningMap[e._id.toString()] = e })
            data.top_earners = topAgg
                .filter(t => t.total > 0)
                .map(t => {
                    const e = earningMap[t._id?.toString()]
                    return {
                        name: e?.member_id?.fullname || "N/A",
                        username: e?.member_id?.username || "N/A",
                        accumulated: t.total || 0
                    }
                })
        } else {
            const topEarners = await BinaryEarning.find()
                .sort({ accumulated: -1 })
                .limit(10)
                .populate({ path: 'member_id', select: 'fullname username' })

            data.top_earners = topEarners
                .filter(e => e.accumulated > 0)
                .map(e => ({
                    name: e.member_id?.fullname || "N/A",
                    username: e.member_id?.username || "N/A",
                    accumulated: e.accumulated || 0
                }))
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.log(err)
        return new NextResponse(err, {
            status: 500,
        });
    }

}