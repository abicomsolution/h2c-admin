"use client"
import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Datepicker, Button } from "flowbite-react";
import PrimaryBtn from "@/components/primaryBtn";
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
            <Button pill size="sm" onClick={handleAction} className="px-4 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:bg-gradient-to-br focus:ring-red-300 dark:focus:ring-red-800">View</Button>                            
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
            selector:  row => moment(row.date_created).format("MMM-DD-YYYY hh:mm A"),
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
                        data={pending}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                    />
    }

  
    return (
        <div className="mt-4 px-2">            
           <div className="md:flex justify-between">
                <div className="flex gap-4">
                    <Datepicker value={dateFrom} onChange={handleChangeDateFrom}/>
                   <Datepicker value={dateTo} onChange={handleChangeDateTo}/>
                </div>
                <div className="mt-4 md:mt-0 md:flex gap-2">
               
                </div>
           </div>           
            <div className='mt-4'>
                {content}
            </div>
            <View showView={showView} setshowView={setshowView} request={request} onCloseSuccess={handleonCloseSuccess} type/>
            <Toaster position="top-center" reverseOrder={false}/>
        </div>
    )
}




const customStyles = {
    rows: {
        style: {
            fontSize: "15px",            
            // minHeight: '50px',
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
            fontSize: "16px",
            fontWeight: "800",
            paddingTop: '18px',  
            paddingBottom: '18px',  
            backgroundColor: "#4371e90d",
            color: "#404a60"           
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
        pageButtonsStyle: {
            fill: "#fff"
        }
    },
    noData: {
        style: {
            backgroundColor: "#fff",
            color: "#fff"
        }
    }
};