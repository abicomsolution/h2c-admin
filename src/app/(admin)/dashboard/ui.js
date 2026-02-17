"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import { roundToTwo } from "@/utils/functions";
import { BadgeDollarSign, Coins, Tags, TrendingUp, Users, Wallet } from "lucide-react";


const tmpData = {
    member: 1,
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
    adminfee: 12,    
    usedcodes: 0,
    unused_codes: 0,
    cd_codes: 0,
    cd_usedcodes: 0,  
    cd_unusedcodes: 0    
}

export default function Main(props) {

    const { user } = props
    
    const router = useRouter();    
    const [loadstate, setloadstate] = useState("")
    const [data, setdata] = useState(tmpData)

   useEffect(() => {
        if (user) {
            // const udata = JSON.parse(user);
            // setuserdata(udata)
            init()
        }
    }, [user]);
    

    const init = async (dtF, dtT)=>{
        setloadstate("loading")     
        try{           
        
            // setloadstate("success")
            // let params = {
            //     dateFrom: dtF,
            //     dateTo: dtT                
            // }
            const ret =  await callApi("/dashboard") 
            if (ret.status==200){                
                setdata(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }        
    }

    const numberFormat = (value, digits = 0) =>
        Number(roundToTwo(value || 0)).toLocaleString("en", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        })

    const moneyFormat = (value) => `₱${numberFormat(value, 2)}`

    const paidCodesTotal = Number(data.usedcodes || 0) + Number(data.unused_codes || 0)
    const paidCodesUsage = paidCodesTotal ? Number(data.usedcodes || 0) / paidCodesTotal : 0
    const cdCodesTotal = Number(data.cd_codes || 0) || (Number(data.cd_usedcodes || 0) + Number(data.cd_unusedcodes || 0))
    const cdCodesUsage = cdCodesTotal ? Number(data.cd_usedcodes || 0) / cdCodesTotal : 0

    const primaryCards = [
        {
            title: "Total Sales",
            value: moneyFormat(data.tsales),
            helper: "Gross revenue recorded",
            icon: TrendingUp,
            accent: "from-sky-500 to-sky-600"
        },
        {
            title: "Total Members",
            value: numberFormat(data.member),
            helper: "Active member count",
            icon: Users,
            accent: "from-emerald-500 to-emerald-600"
        },
        {
            title: "Paid Codes Used",
            value: numberFormat(data.usedcodes),
            helper: `${numberFormat(paidCodesTotal)} issued codes`,
            icon: Tags,
            accent: "from-amber-500 to-amber-600"
        },
        {
            title: "Pending Payout",
            value: moneyFormat(data.com_pending),
            helper: "Awaiting approval",
            icon: Wallet,
            accent: "from-slate-700 to-slate-900"
        }
    ]

    const earningsCards = [
        { title: "Direct Referral", value: moneyFormat(data.direct) },
        { title: "Indirect Referral", value: moneyFormat(data.indirect) },
        { title: "CTP", value: moneyFormat(data.ctp) },
        { title: "Leadership Royalty", value: moneyFormat(data.royalty) },
        { title: "Unilevel", value: moneyFormat(data.unilevel) }
    ]

    const payoutCards = [
        { title: "Accumulated Commission", value: moneyFormat(data.com_accumlated) },
        { title: "Paid Commissions", value: moneyFormat(data.com_paid) },
        { title: "Total Tax", value: moneyFormat(data.tax) },
        { title: "Admin Fee", value: moneyFormat(data.adminfee) }
    ]

    const isLoading = loadstate === "loading"

    return (
        <div className="w-full">
            <div className="space-y-8">
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Performance overview</h2>
                        <p className="mt-1 text-sm text-slate-500">Live totals for member activity, sales, and commissions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live data</span>
                        {isLoading ? (
                            <span className="text-xs font-medium text-slate-400">Refreshing metrics...</span>
                        ) : (
                            <span className="text-xs font-medium text-slate-400">Updated just now</span>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {primaryCards.map((card) => (
                        <div key={card.title} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Live</span>
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-500">{card.title}</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                            <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Codes Overview</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">Usage rate</h3>
                            </div>
                            <Tags className="h-5 w-5 text-slate-400" />
                        </div>

                        <div className="mt-6 space-y-6">
                            <div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Paid Codes</p>
                                        <p className="mt-1 text-2xl font-semibold text-slate-900">{numberFormat(data.usedcodes)}</p>
                                        <p className="text-xs text-slate-500">of {numberFormat(paidCodesTotal)} issued</p>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-600">{Math.round(paidCodesUsage * 100)}%</span>
                                </div>
                                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-emerald-500"
                                        style={{ width: `${Math.round(paidCodesUsage * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">CD Codes</p>
                                        <p className="mt-1 text-2xl font-semibold text-slate-900">{numberFormat(data.cd_usedcodes)}</p>
                                        <p className="text-xs text-slate-500">of {numberFormat(cdCodesTotal)} issued</p>
                                    </div>
                                    <span className="text-sm font-semibold text-sky-600">{Math.round(cdCodesUsage * 100)}%</span>
                                </div>
                                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-sky-500"
                                        style={{ width: `${Math.round(cdCodesUsage * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Commissions</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-900">Commission health</h3>
                            </div>
                            <BadgeDollarSign className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">Accumulated</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">{moneyFormat(data.com_accumlated)}</p>
                                </div>
                                <Coins className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">Paid out</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">{moneyFormat(data.com_paid)}</p>
                                </div>
                                <Wallet className="h-5 w-5 text-sky-500" />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">Pending</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">{moneyFormat(data.com_pending)}</p>
                                </div>
                                <BadgeDollarSign className="h-5 w-5 text-amber-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Earnings</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">Commission breakdown</h3>
                        </div>
                        <TrendingUp className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        {earningsCards.map((card) => (
                            <div key={card.title} className="rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase text-slate-400">{card.title}</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Deductions</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">Payouts and fees</h3>
                        </div>
                        <Wallet className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {payoutCards.map((card) => (
                            <div key={card.title} className="rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase text-slate-400">{card.title}</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}