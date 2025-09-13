"use client"
import DataTable from 'react-data-table-component';
import React, { useEffect, useState} from 'react';
import { Search } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import { interFont } from '../layout';
import moment from 'moment';
import NoRecord from '@/components/NoRecord';

export default function Earnings(props) {

    const { data: session, status } = useSession();
    const router = useRouter();
    const [members, setMembers] = useState([]);
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
            const ret =  await callApi("/member") 
            if (ret.status==200){                
                setMembers(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }

    const handleChange = (e)=>{

    }


    let content = <PreLoader/>

  
    const columns = [
       
        {
            name: "Username",
            selector:  row => row.username,
            width: "200px",    
            sortable: true        
        },
        {
            name: "Name",
            selector:  row => row.fullname,
            sortable: true,
            width: "300px",                    
        },
        {
            name: "Date Signup",
            selector:  row => moment(row.date_signup).format("MMM DD, YYYY"),
            sortable: true,
             width: "160px",                   
        },
        {
            name: "Email",
            selector:  row => row.emailadd,
            sortable: true,
            width: "200px",                       
        },
         {
            name: "Contact No.",
            selector:  row => row.mobile1,
            sortable: true                
        },
        {
            name: "Birthdate",
            selector:  row => row.birthdate?moment(row.birthdate).format("MMM DD, YYYY"):"--",
            sortable: true,
            width: "140px",                    
        },
         {
            name: "Sponsor",
            selector:  row => row.sponsorid?row.sponsorid.fullname:"--",
            sortable: true,
            width: "300px",                                    
        },
        {
            name: "Date Activated",
            selector:  row => row.date_time_activated?moment(row.date_time_activated).format("MMM DD, YYYY"):"-",
            sortable: true,
            width: "160px",                          
        },
        {
            name: "CD",
            selector:  row => row.isCd?"CD":"-",
            width: "250px",                   
            sortable: true        
        },
        
    ];

    if (loadstate==="success"){
        content =  <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={members}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                    />
    }

    
    return (
        <div className={`${interFont.className} w-full px-6`}>                    
            <div className="h-full bg-white rounded-xl p-6 ">
                <div className='flex'>                    
                    <div className="border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-4 relative mt-2">
                        <input className="w-11/12 text-sm bg-transparent focus:outline-none" placeholder="Search...." id="search" name="search"  type="text" onChange={handleChange}/>
                            <span className="absolute ltr:right-5 rtl:left-5 top-1/2 cursor-pointer -translate-y-1/2">
                                <Search className='h-6 w-6'/>
                            </span>
                    </div>                    
                </div>
                 <div className='mt-4 overflow-x-auto max-w-[800px] md:max-w-[1000px] lg:max-w-[1500px]'>
                    {content}                    
                 </div>
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