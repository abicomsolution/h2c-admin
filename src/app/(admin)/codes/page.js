
"use client"
import React, { useEffect, useMemo, useState} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PrimaryBtn from "@/components/primaryBtn";
import DataTable from 'react-data-table-component';
import Generate from "./generate";
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";
import Send from "./send";
import { CODETYPE } from "@/utils/constants";

export default function Codes(props) {

    const [showGenerate, setshowGenerate] = useState(false)
    const [showSend, setshowSend] = useState(false)
 
    const session = useSession()
    const [initialized, setinitialized] = useState(false) 

    const router = useRouter();
    const [codes, setcodes] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [searchTerm, setsearchTerm] = useState("")
    const [typeFilter, settypeFilter] = useState("all")
        

    // useEffect(() => {
        
    //     if (status === "unauthenticated") {
    //         router.replace("/login");
    //     }else if (status === "authenticated") {               
    //         init()        
    //     }
    
    // }, [status, session, router]);

      useEffect(() => {
    
        if (session.status === "unauthenticated") {
            router.replace("/login");
        }else if (session.status=="authenticated"){                 
            setinitialized(true)                
        }
    
    }, [session])


    useEffect(() => {
        
      if (initialized){        
          init()   
      }
      
    }, [initialized])


    const init = async ()=>{
        setloadstate("loading")     
        try{           
            // setTimeout(() => {
            //     setloadstate("success")
            // }, 2000);      
            let params = { status: 0}
            const ret =  await callApi("/code/available", "PUT", params) 
            if (ret.status==200){                
                setcodes(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }


    const handleGen = ()=>{
        setshowGenerate(true)
    }

    const handleSend = ()=>{
        setshowSend(true)
    }

    const handleGenSuccess = ()=>{
        setshowGenerate(false)
        init()   
    }

    const handleSendSuccess = ()=>{
        setshowSend(false)
        init()
    }

    let content = <PreLoader/>

  
    const columns = [
        {
            name: "Date/Time",
            selector:  row => moment(row.date_created).format("MMM-DD-YYYY hh:mm A"),
            sortable: true,
            width: "250px",                   
        },
        {
            name: "Code",
            selector:  row => row.codenum,
            width: "250px",                   
            sortable: true        
        },
        {
            name: "From",
            selector:  row => row.sender_id?.fullname || "-",                       
            sortable: true        
        },      
        {
            name: "Code Type",
            selector:  row => CODETYPE.find((item) => item.value === row.codetype)?.label || "-",
            sortable: true
        },
        {
            name: "",
            cell: row => (
                <span
                    className={
                        row.isCD
                            ? "inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                            : row.isFS
                            ? "inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700"
                            : "inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                    }
                >
                    {row.isCD ? "Commission Deduction" : row.isFS ? "Privilege Slot" : "Paid"}
                </span>
            ),
            width: "250px",                   
            sortable: true        
        },
       
    ];

    const stats = useMemo(() => {
        const paidCount = codes.filter((code) => !code.isCD && !code.isFS).length
        const cdCount = codes.filter((code) => code.isCD).length
        const fsCount = codes.filter((code) => code.isFS).length

        return {
            total: codes.length,
            paid: paidCount,
            commissionDeduction: cdCount,
            privilegeSlot: fsCount
        }
    }, [codes])

    const summaryByType = useMemo(() => {
        return CODETYPE.map((item) => {
            const paid = codes.filter((code) => !code.isCD && !code.isFS && code.codetype === item.value).length
            const commission = codes.filter((code) => code.isCD && code.codetype === item.value).length
            const privilegeSlot = codes.filter((code) => code.isFS && code.codetype === item.value).length

            return {
                ...item,
                paid,
                commission,
                privilegeSlot
            }
        })
    }, [codes])


    const filteredCodes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        return codes.filter((code) => {
            const matchesSearch =
                normalizedSearch === "" ||
                code.codenum?.toLowerCase().includes(normalizedSearch) ||
                code.sender_id?.fullname?.toLowerCase().includes(normalizedSearch)

            const matchesType =
                typeFilter === "all" ||
                Number(typeFilter) === code.codetype

            return matchesSearch && matchesType
        })
    }, [codes, searchTerm, typeFilter])


    if (loadstate==="success"){
        content =   <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={filteredCodes}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                        highlightOnHover
                        pointerOnHover
                    />
    }

  
    return (
        <div className="mt-4 px-2">
            <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-sm">
                <div className="absolute -right-24 -top-16 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl" />
                <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-amber-100/70 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Activation Codes </p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-800">Manage and distribute activation codes</h1>
                            <p className="mt-2 max-w-xl text-sm text-slate-500">
                                Generate new activation codes, transfer to members, and codes track availability.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <PrimaryBtn type="button" onClick={handleGen} >Generate Codes</PrimaryBtn>
                            <PrimaryBtn type="button" onClick={handleSend} >Send Codes</PrimaryBtn>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_2fr]">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Paid</p>
                                <p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.paid}</p>
                                <p className="mt-1 text-xs text-slate-400">All paid activation codes</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Commission Deduction</p>
                                <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.commissionDeduction}</p>
                                <p className="mt-1 text-xs text-slate-400">All commission deduction codes</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Privilege Slot</p>
                                <p className="mt-2 text-2xl font-semibold text-purple-600">{stats.privilegeSlot}</p>
                                <p className="mt-1 text-xs text-slate-400">All privilege slot codes</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:col-span-2">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Available</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.total}</p>
                                <p className="mt-1 text-xs text-slate-400">Paid + commission deduction + privilege slot</p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Per Code Type</p>                                
                            </div>
                            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                                <div className="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr] bg-slate-50 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    <span>Code Type</span>
                                    <span className="text-right">Paid</span>
                                    <span className="text-right">CD</span>
                                    <span className="text-right">FS</span>
                                </div>
                                <div className="divide-y divide-slate-200 bg-white">
                                    {summaryByType.map((item) => (
                                        <div key={item.value} className="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr] items-center px-2.5 py-2">
                                            <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                                            <p className="text-right text-xs font-semibold text-emerald-600">{item.paid}</p>
                                            <p className="text-right text-xs font-semibold text-amber-600">{item.commission}</p>
                                            <p className="text-right text-xs font-semibold text-purple-600">{item.privilegeSlot}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Available Codes</h2>
                        <p className="text-sm text-slate-500">Filter inventory and keep an eye on distribution status.</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setsearchTerm(event.target.value)}
                                placeholder="Search code or sender"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(event) => settypeFilter(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 sm:max-w-[220px]"
                        >
                            <option value="all">All code types</option>
                            {CODETYPE.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    {content}
                </div>
            </section>

           <Generate showGenerate={showGenerate} setshowGenerate={setshowGenerate} onCloseSuccess={handleGenSuccess}/>
           <Send showSend={showSend} setshowSend={setshowSend} onCloseSuccess={handleSendSuccess} user={session?.user}/>
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
            opacity: 0.92,
             '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: "#e2e8f0"
            },
            '&:hover': {
                backgroundColor: "#f8fafc"
            }
        }
    },
    headRow: {
        style: {
            borderBottomColor: "#e2e8f0"
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
        },
    },
    noData: {
        style: {
            backgroundColor: "#fff",
            color: "#475569"
        }
    }
};