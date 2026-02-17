

"use client"
import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Datepicker } from "flowbite-react";
import PrimaryBtn from "@/components/primaryBtn";
import DataTable from 'react-data-table-component';
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";
import AEForm from "./aeform";
import toast, { Toaster } from 'react-hot-toast';
import { ceil } from "lodash";
import { Button } from "flowbite-react";
import Delete from "./delete";


export const tmpForm = {
    name: "",
    description: "",
    status: 0
}

export default function CategoryMethod(props) {

    const { data: session, status } = useSession();

    const router = useRouter();
    const [data, setdata] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [showAe, setshowAe ] = useState(false)
    const [bEdit, setbEdit] = useState(false)
    const [selectedData, setselectedData] = useState(tmpForm)
    const [showDelete, setshowDelete] = useState(false)

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
            const ret =  await callApi("/setting/category/", "GET") 
            if (ret.status==200){                
                setdata(ret.data)
                setloadstate("success")
            }else{    
                console.log(ret)          
                setloadstate("")
            }
        }catch(err){
            console.log(err)
            setloadstate("")
        }        
    }


    const handleAdd= ()=>{
        setbEdit(false)
        setselectedData(tmpForm)
        setshowAe(true)
    }

    const handleCloseAE = ()=>{
       
        if (bEdit){
            toast.success('Changes successfully saved!')
        }else{
            toast.success('New product category successfully saved!')
        }
        
        
        setbEdit(false)
        setselectedData(tmpForm)
        setshowAe(false)
        init()
    }

    const handleSuccessDelete = ()=>{
        setselectedData(tmpForm)
        setshowDelete(false)
        toast.success('Product category sucessfully deleted!')
        init()
    }
    
    const renderCol = (row)=>{

        const handleEdit =()=>{           
            setselectedData(row)
            setbEdit(true)
            setshowAe(true)
        }

        const handleDelete=()=>{
            setselectedData(row)
            setshowDelete(true)
        }

        return(
            <div className="flex gap-2">
                <Button pill size="sm" onClick={handleEdit} className="px-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:bg-gradient-to-br focus:ring-red-300 dark:focus:ring-red-800">Edit</Button>
                <Button pill size="sm" onClick={handleDelete} className="px-4 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:bg-gradient-to-br focus:ring-red-300 dark:focus:ring-red-800">Delete</Button>
            </div>
        )
    }

    const columns = [    
        {
            name: "Name",
            selector:  row => row.name,    
            width: "350px",                    
            sortable: true        
        },
        {
            name: "Description",
            selector:  row => row.description,         
            sortable: true
        },
        {
            name: "",                       
            cell: renderCol,
            width: "200px",        
            sortable: true        
        }               
    ];
    
   

    let content = <PreLoader/>
    

    if (loadstate==="success"){
        content =   <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={data}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                    />
    }

    return (
        <div className="mt-6 px-2">          
            <div className="md:flex justify-between">
               
                <div className="mt-4 md:mt-0 md:flex gap-2">
                    <PrimaryBtn type="button" onClick={handleAdd} >Add New Product Category</PrimaryBtn>                    
                </div>
                 <div className="flex gap-4">
                    
                </div>
            </div>  
             <div className='mt-4'>
                {content}
            </div>    
            <AEForm showAe={showAe} setshowAe={setshowAe} onCloseSuccess={handleCloseAE} bEdit={bEdit} data={selectedData} />
            <Toaster position="top-center" reverseOrder={false}/>
            <Delete showDelete={showDelete} setshowDelete={setshowDelete} data={selectedData} onCloseSuccess={handleSuccessDelete}/>
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