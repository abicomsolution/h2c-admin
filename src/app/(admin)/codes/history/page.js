
"use client"
import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DataTable from 'react-data-table-component';
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";
import { CODETYPE } from "@/utils/constants";

export default function History(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false) 
    const router = useRouter();
    const [codes, setcodes] = useState([]);
    const [loadstate, setloadstate] = useState("")

    useEffect(() => {
    
        if (session.status === "unauthenticated") {
            router.replace("/login");
        } else if (session.status === "authenticated") {                 
            setinitialized(true)                
        }
    
    }, [session])

    useEffect(() => {
        
        if (initialized) {        
            init()   
        }
      
    }, [initialized])

    const init = async () => {
        setloadstate("loading")     
        try {           
            const ret = await callApi("/code/history", "POST", {}) 
            if (ret.status == 200) {                
                setcodes(ret.data)
                setloadstate("success")
            } else {              
                setloadstate("")
            }
        } catch(err) {
            console.log(err)
            setloadstate("")
        }
    }

    console.log(codes)

    const columns = [
         {
            name: "Type",
            selector:  row => row.transtype==0?"Sent":"Received",                            
            sortable: true,
            width: "120px",  
            center: "true"            
        },    
        {
            name: "Date/Time Sent",
            selector: row => moment(row.time_sent).format("MMM-DD-YYYY hh:mm A"),
            sortable: true,
            width: "220px",                   
        },
        {
            name: "Receiver",
            selector: row => row.receiver_id?.fullname + ` (${row.receiver_id?.username})`,
            sortable: true,          
        },
        {
            name: "Quantity",
            selector: row => row.count,
            sortable: true,
            center: true,
            width: "110px",
        },
        {
            name: "Code Type",
            selector: row => CODETYPE.find(t => t.value === row.code_id?.codetype)?.label || "-",
            sortable: true,
            width: "160px",
        },
        {
            name: "",
            cell: row => {
                const isCD = row.code_id?.isCD
                const isFS = row.code_id?.isFS
                if (isCD) {
                    return <span className="text-xs font-medium px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">CD</span>
                } else if (isFS) {
                    return <span className="text-xs font-medium px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">FS</span>
                }
                return <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>
            },
            width: "90px",
            sortFunction: (a, b) => {
                const val = r => r.code_id?.isCD ? 2 : r.code_id?.isFS ? 1 : 0
                return val(a) - val(b)
            },
            sortable: true,
        },
    ];

    let content = <PreLoader/>

    if (loadstate === "success") {
        content = <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={codes}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                        highlightOnHover
                        pointerOnHover
                    />
    }

    return (
        <div className="mt-4 px-2">
            <div className="mt-4">
                {content}
            </div>
        </div>
    )
}

const customStyles = {
    rows: {
        style: {
            fontSize: "15px",
            color: "#404a60",  
            paddingTop: '18px',  
            paddingBottom: '18px',              
            opacity: 0.9,
            '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: "#e5e7ebad"
            }
        }
    },
    headRow: {
        style: {
            borderBottomColor: "#e5e7eb"
        }
    },
    headCells: {
        style: {
            fontSize: "13px",
            fontWeight: "700",
            paddingTop: '10px',  
            paddingBottom: '10px',  
            backgroundColor: "#4371e90d",
            color: "#404a60",
            textTransform: "uppercase",
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
            color: "#fff"
        }
    }
};