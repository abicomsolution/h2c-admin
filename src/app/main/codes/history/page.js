
"use client"
import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DataTable from 'react-data-table-component';
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";

export default function History(props) {

    const [showGenerate, setshowGenerate] = useState(false)
    const [showSend, setshowSend] = useState(false)
 
    const session = useSession()
    const [initialized, setinitialized] = useState(false) 

    const router = useRouter();
    const [codes, setcodes] = useState([]);
    const [loadstate, setloadstate] = useState("")
        


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
            const ret =  await callApi("/code/history", "POST", {}) 
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
            name: "Date/Time Sent",
            selector:  row => moment(row.time_sent).format("MMM-DD-YYYY hh:mm A"),
            sortable: true,
            width: "250px",                   
        },
        {
            name: 'Receiver',
            selector: row=>row.receiver_id?.fullname + ` (${row.receiver_id?.username})`,
            sortable: true,          
        },
        {
            name: 'Count',
            selector: row=>row.count,
            sortable: true,
            center: "true"         
        }      
       
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
        <div className="mt-4 px-2">            
           
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