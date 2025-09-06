
"use client"
import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Datepicker } from "flowbite-react";
import PrimaryBtn from "@/components/primaryBtn";
import DataTable from 'react-data-table-component';
import Generate from "./generate";
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";
import Send from "./send";

export default function Codes(props) {

    const [showGenerate, setshowGenerate] = useState(false)
    const [showSend, setshowSend] = useState(false)
    const { data: session, status } = useSession();

    const router = useRouter();
    const [codes, setcodes] = useState([]);
    const [loadstate, setloadstate] = useState("")
        

    useEffect(() => {
        
        if (status === "unauthenticated") {
            router.replace("/login");
        }else if (status === "authenticated") {               
            init()        
        }
    
    }, [status, session, router]);


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
            selector:  row => row.sender_id.fullname,                       
            sortable: true        
        },
       
    ];


    if (loadstate==="success"){
        content =   <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={codes}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                    />
    }

  
    return (
        <div className="mt-6 px-2">            
           <div className="md:flex justify-between">
                <div className="flex gap-4">
                    <Datepicker />
                    <Datepicker />
                </div>
                <div className="mt-4 md:mt-0 md:flex gap-2">
                    <PrimaryBtn type="button" onClick={handleGen} >Generate Codes</PrimaryBtn>
                    <PrimaryBtn type="button" onClick={handleSend} >Send Codes</PrimaryBtn>
                </div>
           </div>
           <Generate showGenerate={showGenerate} setshowGenerate={setshowGenerate} onCloseSuccess={handleGenSuccess}/>
           <Send showSend={showSend} setshowSend={setshowSend} onCloseSuccess={handleSendSuccess} user={session?.user}/>
            <div className='mt-4'>
                {content}
            </div>
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