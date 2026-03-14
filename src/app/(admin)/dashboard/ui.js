"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import { roundToTwo } from "@/utils/functions";
import { BadgeDollarSign, BarChart3, CalendarDays, Coins, Crown, Filter, Package, Tags, TrendingUp, Users, Wallet } from "lucide-react";

const tmpData = {
    total_members: 0,
    total_sales: 0,
    total_binary_earnings: 0,
    pending_withdrawal: 0,
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

export default function Main(props) {

    const { user } = props
    const router = useRouter();    
    const [loadstate, setloadstate] = useState("")
    const [data, setdata] = useState(tmpData)

    const now = new Date()
    const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
    const [filterYear, setFilterYear] = useState(now.getFullYear())

    const months = [
        { value: 0, label: "All Months" },
        { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
        { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
        { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
        { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
    ]

    const years = []
    for (let y = now.getFullYear(); y >= 2024; y--) years.push(y)

    useEffect(() => {
        if (user) {
            init()
        }
    }, [user]);

    const init = async (month, year) => {
        const m = month !== undefined ? month : filterMonth
        const y = year !== undefined ? year : filterYear
        setloadstate("loading")     
        try {
            let endpoint = "/dashboard/v2"
            const params = []
            if (m > 0) params.push(`month=${m}`)
            if (y) params.push(`year=${y}`)
            if (params.length > 0) endpoint += `?${params.join('&')}`
            const ret = await callApi(endpoint) 
            if (ret.status == 200) {                
                setdata(ret.data)
                setloadstate("success")
            } else {              
                setloadstate("")
            }
        } catch(err) {
            console.log(err)
            setloadstate("")
        }        
    }

    const handleMonthChange = (e) => {
        const val = parseInt(e.target.value)
        setFilterMonth(val)
        init(val, filterYear)
    }

    const handleYearChange = (e) => {
        const val = parseInt(e.target.value)
        setFilterYear(val)
        init(filterMonth, val)
    }

    const handleClearFilter = () => {
        setFilterMonth(0)
        setFilterYear(now.getFullYear())
        init(0, null)
    }

    const numberFormat = (value, digits = 0) =>
        Number(roundToTwo(value || 0)).toLocaleString("en", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        })

    const moneyFormat = (value) => `₱${numberFormat(value, 2)}`

    const usagePercent = data.total_codes > 0 ? Math.round((data.total_used / data.total_codes) * 100) : 0

    const primaryCards = [
        {
            title: "Total Sales",
            value: moneyFormat(data.total_sales),
            helper: `${numberFormat(data.paid_count)} paid codes (excl. CD/PS)`,
            icon: TrendingUp,
            accent: "from-sky-500 to-sky-600"
        },
        {
            title: "Binary Accounts",
            value: numberFormat(data.total_members),
            helper: "Active binary slots",
            icon: Users,
            accent: "from-emerald-500 to-emerald-600"
        },
        {
            title: "Binary Earnings",
            value: moneyFormat(data.total_binary_earnings),
            helper: "Total accumulated",
            icon: Coins,
            accent: "from-violet-500 to-violet-600"
        },
        {
            title: "Pending Payout",
            value: moneyFormat(data.pending_withdrawal),
            helper: "Awaiting approval",
            icon: Wallet,
            accent: "from-amber-500 to-amber-600"
        }
    ]

    const earningTypes = [
        { title: "Direct", value: data.direct, color: "bg-emerald-500" },
        { title: "Double Direct", value: data.doubledirect, color: "bg-sky-500" },
        { title: "Sales Match", value: data.salesmatch, color: "bg-violet-500" },
        { title: "Performance", value: data.performance, color: "bg-amber-500" },
        { title: "Stairstep", value: data.stairstep, color: "bg-rose-500" },
        { title: "Breakaway", value: data.breakaway, color: "bg-indigo-500" },
        { title: "Hub Royalty", value: data.hubroyalty, color: "bg-teal-500" }
    ]

    const totalEarningsSum = earningTypes.reduce((s, e) => s + (e.value || 0), 0)

    const pkgAccents = {
        1: "from-slate-500 to-slate-600",
        2: "from-sky-500 to-sky-600",
        3: "from-emerald-500 to-emerald-600",
        4: "from-violet-500 to-violet-600",
        5: "from-amber-500 to-amber-600"
    }

    const pkgBarColors = {
        1: "bg-slate-500",
        2: "bg-sky-500",
        3: "bg-emerald-500",
        4: "bg-violet-500",
        5: "bg-amber-500"
    }

    const maxTrend = data.monthly_trend?.length > 0 
        ? Math.max(...data.monthly_trend.map(m => m.total)) 
        : 0

    const isLoading = loadstate === "loading"

    if (isLoading) return <PreLoader />

    return (
        <div className="w-full pt-6">
            <div className="space-y-8">

                {/* Month/Year Filter */}
                <div className="flex flex-wrap items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <select
                        value={filterMonth}
                        onChange={handleMonthChange}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <select
                        value={filterYear}
                        onChange={handleYearChange}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    {(filterMonth > 0) && (
                        <button
                            onClick={handleClearFilter}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 transition"
                        >
                            Clear filter
                        </button>
                    )}
                    {loadstate === "loading" && (
                        <span className="text-xs text-slate-400">Loading...</span>
                    )}
                </div>

                {/* Primary KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {primaryCards.map((card) => (
                        <div key={card.title} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">V2</span>
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-500">{card.title}</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
                            <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
                        </div>
                    ))}
                </div>

                {/* Code Summary: Paid / CD / PS */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70">Paid Codes</p>
                            <Tags className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{numberFormat(data.paid_count)}</p>
                        <p className="mt-1 text-xs text-slate-400">Regular activations (counted in sales)</p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600/70">CD Codes</p>
                            <Tags className="h-4 w-4 text-orange-500" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{numberFormat(data.cd_count)}</p>
                        <p className="mt-1 text-xs text-slate-400">Commission Deduction (excluded from sales)</p>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-purple-600/70">PS Codes</p>
                            <Tags className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{numberFormat(data.fs_count)}</p>
                        <p className="mt-1 text-xs text-slate-400">Privilege Slot (excluded from sales)</p>
                    </div>
                </div>

                {/* Package Breakdown */}
                <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Package Analytics</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">Code activation by package</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Package className="h-5 w-5 text-slate-400" />
                            <span>{usagePercent}% overall usage</span>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {(data.codes_by_type || []).map((pkg) => (
                            <div key={pkg.codetype} className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center rounded-lg bg-gradient-to-br ${pkgAccents[pkg.codetype] || "from-slate-500 to-slate-600"} px-2.5 py-1 text-xs font-bold text-white`}>
                                        {pkg.label}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">₱{numberFormat(pkg.price)}</span>
                                </div>
                                <p className="mt-3 text-xl font-bold text-slate-900">{numberFormat(pkg.used)} <span className="text-sm font-normal text-slate-400">/ {numberFormat(pkg.total)}</span></p>
                                <p className="mt-1 text-xs text-slate-500">Sales: {moneyFormat(pkg.sales)}</p>
                                <div className="mt-2 flex items-center gap-3 text-[11px]">
                                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-slate-500">Paid</span> <span className="font-bold text-slate-700">{pkg.paid_used || 0}</span></span>
                                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /><span className="text-slate-500">CD</span> <span className="font-bold text-slate-700">{pkg.cd_used || 0}</span></span>
                                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" /><span className="text-slate-500">PS</span> <span className="font-bold text-slate-700">{pkg.fs_used || 0}</span></span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                                        <div className={`h-1.5 rounded-full ${pkgBarColors[pkg.codetype] || "bg-slate-500"}`} style={{ width: `${pkg.usage}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">{pkg.usage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Binary Earnings + Commission Health */}
                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">

                    {/* Binary Earnings Breakdown */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Binary Earnings</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">Commission breakdown</h3>
                            </div>
                            <TrendingUp className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="mt-5 space-y-3">
                            {earningTypes.map((e) => {
                                const pct = totalEarningsSum > 0 ? Math.round((e.value / totalEarningsSum) * 100) : 0
                                return (
                                    <div key={e.title} className="flex items-center gap-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${e.color}`} />
                                        <span className="w-28 text-sm font-medium text-slate-600">{e.title}</span>
                                        <div className="flex-1">
                                            <div className="h-2 rounded-full bg-slate-100">
                                                <div className={`h-2 rounded-full ${e.color} transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="w-24 text-right text-sm font-semibold text-slate-900">{moneyFormat(e.value)}</span>
                                        <span className="w-10 text-right text-xs text-slate-400">{pct}%</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-sm font-semibold text-slate-700">Total</span>
                            <span className="text-lg font-bold text-slate-900">{moneyFormat(totalEarningsSum)}</span>
                        </div>
                    </div>

                    {/* Commission Health */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Commissions</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">Payout health</h3>
                            </div>
                            <BadgeDollarSign className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-emerald-600/70">Accumulated</p>
                                    <p className="mt-1 text-lg font-bold text-slate-900">{moneyFormat(data.accumulated)}</p>
                                </div>
                                <Coins className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-sky-600/70">Withdrawn</p>
                                    <p className="mt-1 text-lg font-bold text-slate-900">{moneyFormat(data.withdrawn)}</p>
                                </div>
                                <Wallet className="h-5 w-5 text-sky-500" />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-violet-600/70">Balance</p>
                                    <p className="mt-1 text-lg font-bold text-slate-900">{moneyFormat(data.balance)}</p>
                                </div>
                                <BadgeDollarSign className="h-5 w-5 text-violet-500" />
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-lg border border-slate-200/60 bg-slate-50 px-3 py-2 text-center">
                                <p className="text-[10px] font-bold uppercase text-slate-400">Paid Out</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{moneyFormat(data.com_paid)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200/60 bg-slate-50 px-3 py-2 text-center">
                                <p className="text-[10px] font-bold uppercase text-slate-400">Tax</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{moneyFormat(data.tax)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200/60 bg-slate-50 px-3 py-2 text-center">
                                <p className="text-[10px] font-bold uppercase text-slate-400">Admin Fee</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{moneyFormat(data.adminfee)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Trend + Top Earners */}
                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">

                    {/* Monthly Trend */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Trend</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">Monthly binary earnings</h3>
                            </div>
                            <BarChart3 className="h-5 w-5 text-slate-400" />
                        </div>
                        {data.monthly_trend?.length > 0 ? (
                            <div className="mt-6 flex items-end gap-3" style={{ height: 180 }}>
                                {data.monthly_trend.map((m, i) => {
                                    const h = maxTrend > 0 ? Math.max((m.total / maxTrend) * 100, 4) : 4
                                    return (
                                        <div key={i} className="flex flex-1 flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold text-slate-600">{moneyFormat(m.total)}</span>
                                            <div className="w-full flex items-end" style={{ height: 140 }}>
                                                <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-500 to-violet-400 transition-all" style={{ height: `${h}%` }} />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400">{m.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="mt-6 flex h-44 items-center justify-center text-sm text-slate-400">
                                No trend data available
                            </div>
                        )}
                    </div>

                    {/* Top Earners */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Leaderboard</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">Top earners</h3>
                            </div>
                            <Crown className="h-5 w-5 text-amber-400" />
                        </div>
                        {data.top_earners?.length > 0 ? (
                            <div className="mt-5 space-y-2">
                                {data.top_earners.map((earner, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50">
                                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-slate-300"}`}>
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-800">{earner.name}</p>
                                            <p className="text-xs text-slate-400">@{earner.username}</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{moneyFormat(earner.accumulated)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 flex h-44 items-center justify-center text-sm text-slate-400">
                                No earner data yet
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}