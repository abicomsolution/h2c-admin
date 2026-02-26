"use client"
import React, { useEffect, useState, useMemo} from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DataTable from 'react-data-table-component';
import NoRecord from '@/components/NoRecord';
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import moment from 'moment';
import Select from 'react-select'
import { Datepicker } from "flowbite-react";
import { Search } from 'lucide-react';


const opts = [
    {value: -1, label: "All"},
    {value: 0, label: "H2C Wallet"},
    {value: 1, label: "Direct Referral"},
    {value: 2, label: "Double Referral"},
    {value: 3, label: "Sales Match Bonus"},
    {value: 4, label: "Leadership"},
    {value: 5, label: "Stairstep"},
    {value: 6, label: "Breakaway"},
    {value: 7, label: "Hub Royalty"}
]

const controlStyle = {    
    menuPortal: provided => ({ ...provided, zIndex: 9999 }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
    control: (baseStyles) => ({
        ...baseStyles,
        paddingLeft: "6px",
        paddingRight: "6px",
        paddingTop: "2px",
        paddingBottom: "2px",
        borderRadius: "8px",
        borderColor: "#e2e8f0",
        backgroundColor: "#f8fafc",
        fontSize: "14px",
        boxShadow: "none",
        "&:hover": { borderColor: "#94a3b8" }
    }),
}


export default function Transaction(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false) 

    const router = useRouter();
    const [data, setData] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [dateFrom, setdateFrom] = useState(moment().subtract(1,'days').toDate())
    const [dateTo, setdateTo] = useState(new Date())
    const [search, setsearch] = useState("")
    const [selectCat, setselectCat] = useState(opts[0])
            
    useEffect(() => {
    
        if (session.status === "unauthenticated") {
            router.replace("/login");
        }else if (session.status=="authenticated"){                 
            setinitialized(true)                
        }
    
    }, [session])


    useEffect(() => {
        
        if (initialized){        
            init({dateFrom, dateTo, search, selectCat})    
        }
        
    }, [initialized, dateFrom, dateTo]);


    useEffect(()=>{
        const delayDebounceFn = setTimeout(() => {
            // Send Axios request here
            if (search.length===0) {
                init({dateFrom: dateFrom, dateTo, search, selectCat})   
            }else{
                searchNow(search)            
            }                
        }, 500)

        return () => clearTimeout(delayDebounceFn)

    }, [search])
  

    const searchNow = async (searchTerm)=>{

        init({dateFrom: dateFrom, dateTo, search: searchTerm, selectCat})
    }

    const handleChangeDateFrom = (e)=>{        
        setdateFrom(e)
        init({dateFrom: e, dateTo, search, selectCat})   
             
    }

    const handleChangeDateTo = (e)=>{
        setdateTo(e)
        init({dateFrom, dateTo: e, search, selectCat})
    }
    

    const handleChange = (e)=>{
        setsearch(e.target.value)
    }

    const handleChangeCat = (e)=>{
        setselectCat(e)
        init({dateFrom, dateTo, search, selectCat: e})
    }

   const init = async (params)=>{
        console.log("Initializing with params:", params);
        setloadstate("loading")     
        try{                 
            const ret =  await callApi("/trans/v2", "POST", params) 
            if (ret.status==200){                
                setData(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }       

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }

     const renderDesc = (item)=>{

        let desc = ""
        if (item.earning_type==0){
			desc = "H2C Wallet"
		}else if (item.earning_type==1){
			desc = "Direct referral from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
		}else if (item.earning_type==2){
            desc = "Double referral from " +  item.from_member_id.fullname + " (" + item.from_member_id.username +")"
       	}else if (item.earning_type==3){
	        desc = "Sales match from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
        }else if (item.earning_type==4){
	        desc = "Leadership from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
       	}else if (item.earning_type==5){
	        desc = "Stairstep from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
        }else if (item.earning_type==6){
	        desc = "Breakaway from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
        }else if (item.earning_type==7){
	        desc = "Hub Royalty from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
        }
            
        return desc;
    }


    const stats = useMemo(() => {
        const total = data.reduce((sum, r) => sum + (r.amount || 0), 0)
        return {
            count: data.length,
            total
        }
    }, [data])

    let content = <PreLoader/>


    const columns = [    
        {
            name: 'Date/Time',            
            selector: row => moment(row.transdate).format('MM/DD/YYYY LTS'),
            width: "200px",
            sortable: true
        },
        {
            name: 'Member',
            selector: 'earning_id.member_id.fullname',
            cell: row => row.earning_id?.member_id?.fullname + " - (" + row.earning_id?.member_id?.username + ")",
            sortable: true
        },
        {
            name: 'Description',
            selector: row=>row.earning_type,
            sortable: true,  
          	cell: row => renderDesc(row),
            width: "580px",                   
        },
        {
            name: 'Amount',            
            sortable: false,
            right: "true",
            selector: row => row.amount.toLocaleString('en', { minimumFractionDigits: 2 })
        }     
    ];

    if (loadstate==="success"){
        content =  <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={data}
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
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Earnings</p>
                        <h1 className="mt-2 text-2xl font-semibold text-slate-800">Transactions</h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-500">
                            Browse and filter all member earning transactions by date range and category.
                        </p>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Transactions</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.count.toLocaleString()}</p>
                            <p className="mt-1 text-xs text-slate-400">Records in current filter</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Amount</p>
                            <p className="mt-2 text-2xl font-semibold text-emerald-600">₱ {stats.total.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                            <p className="mt-1 text-xs text-slate-400">Sum of filtered transactions</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Transaction Records</h2>
                        <p className="text-sm text-slate-500">Filter by date range, category, or search by member name.</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="relative">
                            <input
                                className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                placeholder="Search member..."
                                value={search}
                                onChange={handleChange}
                                type="text"
                            />
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                        <div className="w-52">
                            <Select
                                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                styles={controlStyle}
                                options={opts}
                                value={selectCat}
                                onChange={handleChangeCat}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">From</span>
                            <Datepicker value={dateFrom} onChange={handleChangeDateFrom} />
                            <span className="text-xs text-slate-400 font-medium">To</span>
                            <Datepicker value={dateTo} onChange={handleChangeDateTo} />
                        </div>
                    </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                    {content}
                </div>
            </section>
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