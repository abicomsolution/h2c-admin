"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Datepicker } from "flowbite-react";
import DataTable from 'react-data-table-component';
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";
import View from "./view";
import toast, { Toaster } from 'react-hot-toast';

let tmpForm = {
    _id: "",
    transdate: new Date(),
    amount: '',    
    member_id: { fullname:'', username: ''},
    paymethod: {name:''},    
    bankname: "",
    accountno: "",
    accountname: "",
    contactno: "",
    tax: 0,
    adminfee: 0,
    net: 0,
    status: 0
}


export default function Pending(props) {

    const { data: session, status } = useSession();

    const router = useRouter();
    const [pending, setpending] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [dateFrom, setdateFrom] = useState(moment().subtract(1,'days').toDate())
    const [dateTo, setdateTo] = useState(new Date())
    const [showView, setshowView] = useState(false)
    const [request, setrequest] = useState(tmpForm)
    const [searchTerm, setSearchTerm] = useState("")
    const [lastUpdated, setLastUpdated] = useState(null)

    useEffect(() => {
        
        if (status === "unauthenticated") {
            router.replace("/login");
        }else if (status === "authenticated") {               
            init(dateFrom, dateTo)        
        }
    
    }, [status, session, router]);


    const init = async (dtF, dtT)=>{
        setloadstate("loading")     
        try{           
        
            let params = {
                dateFrom: dtF,
                dateTo: dtT                
            }
            const ret =  await callApi("/payout", "POST", params) 
            if (ret.status==200){                
                setpending(ret.data)
                setLastUpdated(new Date())
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }

    const handleChangeDateFrom = (e)=>{
        setdateFrom(e)
        init(e, dateTo)        
    }

    const handleChangeDateTo = (e)=>{
        setdateTo(e)
        init(dateFrom, e)
    }

    const renderCol = (row)=>{

        const handleAction =()=>{      
            setrequest(row)     
            setshowView(true)
        }
       
        return(            
            <button
                type="button"
                onClick={handleAction}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
                View
            </button>                            
        )
    }
    
    const handleonCloseSuccess = (i)=>{
        setshowView(false)       
        if (i==0){
            toast.error('Request has been rejected!')
        }else{
            toast.success('Request successfully approved!')
        }
        init(dateFrom, dateTo)  
        setrequest(tmpForm)    
    }

    const filteredPending = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase()
        if (!needle) {
            return pending
        }
        return pending.filter((row) => {
            const memberName = row?.member_id?.fullname || ""
            const memberUser = row?.member_id?.username || ""
            const methodName = row?.paymethod?.name || ""
            const account = row?.accountno || ""
            return [memberName, memberUser, methodName, account]
                .join(" ")
                .toLowerCase()
                .includes(needle)
        })
    }, [pending, searchTerm])

    const summary = useMemo(() => {
        return filteredPending.reduce(
            (acc, row) => {
                acc.count += 1
                acc.amount += Number(row.amount || 0)
                acc.tax += Number(row.tax || 0)
                acc.adminfee += Number(row.adminfee || 0)
                acc.net += Number(row.net || 0)
                return acc
            },
            { count: 0, amount: 0, tax: 0, adminfee: 0, net: 0 }
        )
    }, [filteredPending])

    const formatMoney = (value) =>
        Number(value).toLocaleString("en", { minimumFractionDigits: 2 })

    let content = <PreLoader/>

   
    const columns = [
        {
            name: "",                       
            cell: renderCol,
            width: "100px",        
            sortable: true        
        },
        {
            name: "Date/Time",
            selector:  row => moment(row.transdate).format("MMM-DD-YYYY hh:mm A"),
            sortable: true,
            width: "230px",                   
        },
        {
            name: "Member",
            selector:  row => row.member_id.fullname + "- ("+ row.member_id.username+ ")",            
            sortable: true,
            width: "400px",          
        },
        {
            name: "MOP",
            selector:  row => row.paymethod.name,            
            sortable: true        
        },
        {
            name: 'Amount',
            selector: 'amount',
            selector: row=>row.amount.toLocaleString('en', { minimumFractionDigits: 2 }),
            sortable: false,
            right: "true",        
        },
        {
            name: 'Tax',
            selector: 'tax',
            selector: row=>row.tax.toLocaleString('en', { minimumFractionDigits: 2 }),
            sortable: false,
            right: "true",        
        },
        {
            name: 'Admin Fee',
            selector: 'adminfee',
            selector: row=>row.adminfee.toLocaleString('en', { minimumFractionDigits: 2 }),
            sortable: false,
            right: "true",        
        },
         {
            name: 'Net',
            selector: 'net',
            selector: row=>row.net.toLocaleString('en', { minimumFractionDigits: 2 }),
            sortable: false,
            right: "true",        
        }       
    ];


    if (loadstate==="success"){
        content =   <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={filteredPending}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                    />
    }

  
    return (
        <div className="mt-4 px-2 pb-8"> 
         {/* header */}           
            <section className="relative overflow-visible rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-16 -top-24 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.35),rgba(255,255,255,0))] blur-0 animate-[floatUp_10s_ease-in-out_infinite]" />
                    <div className="absolute -left-12 top-20 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.32),rgba(255,255,255,0))] animate-[floatDown_12s_ease-in-out_infinite]" />
                </div>
                <div className="relative flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">Withdrawal Control</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">Withdrawal Requests</h1>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                {summary.count} pending
                            </span>
                        </div>
                        <p className="max-w-2xl text-xs text-slate-500">
                            Review payout requests, verify member details, and approve or reject in one place.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-2 py-1.5">
                                <Datepicker value={dateFrom} onChange={handleChangeDateFrom} />
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-2 py-1.5">
                                <Datepicker value={dateTo} onChange={handleChangeDateTo} />
                            </div>
                           
                        </div>
                        
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Requests</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{summary.count}</p>
                    <p className="mt-1 text-xs text-slate-500">Queued for review.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Gross Amount</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(summary.amount)}</p>
                    <p className="mt-1 text-xs text-slate-500">Requested total.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Fees + Tax</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(summary.tax + summary.adminfee)}</p>
                    <p className="mt-1 text-xs text-slate-500">Deductions.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-[0_16px_32px_rgba(15,23,42,0.2)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Net Payout</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(summary.net)}</p>
                    <p className="mt-1 text-xs text-slate-300">After deductions.</p>
                </div>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Pending Withdrawal</h2>
                        <p className="text-sm text-slate-500">Search and review each request before approval.</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative">
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search member, method, account"
                                className="w-full min-w-[240px] rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                        >
                            Clear
                        </button>
                    </div>
                </div>
                <div className="mt-5">
                    {content}
                </div>
            </section>

            <View showView={showView} setshowView={setshowView} request={request} onCloseSuccess={handleonCloseSuccess} type/>
            <Toaster position="top-center" reverseOrder={false}/>
            <style jsx global>{`
                @keyframes floatUp {
                    0% { transform: translateY(0px); opacity: 0.9; }
                    50% { transform: translateY(-12px); opacity: 1; }
                    100% { transform: translateY(0px); opacity: 0.9; }
                }
                @keyframes floatDown {
                    0% { transform: translateY(0px); opacity: 0.85; }
                    50% { transform: translateY(10px); opacity: 1; }
                    100% { transform: translateY(0px); opacity: 0.85; }
                }
            `}</style>
        </div>
    )
}




const customStyles = {
    rows: {
        style: {
            fontSize: "14px",            
            color: "#334155",  
            paddingTop: '16px',  
            paddingBottom: '16px',              
            opacity: 0.95,
            backgroundColor: "#fff",
            '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: "#e2e8f0"
            }
        }
    },
    headRow: {
        style: {
            borderBottomColor: "#e2e8f0",
            backgroundColor: "#f8fafc"
        }
    },
    headCells: {
        style: {
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            paddingTop: '16px',  
            paddingBottom: '16px',  
            backgroundColor: "#f8fafc",
            color: "#64748b"           
        }
    },
    cells: {
        style: {
            padding: '0px 16px',            
            backgroundColor: "#fff"            
        },
    },
    pagination: {
        style: {
            backgroundColor: "#fff",
            color: "#475569"

        },
    },
    noData: {
        style: {
            backgroundColor: "#fff",
            color: "#94a3b8"
        }
    }
};