'use client';
import React, { use, useEffect, useRef, useState} from 'react';
import DataTable from 'react-data-table-component';
import NoRecord from '@/components/common/NoRecord';
import { Search, ChevronDown, TriangleAlert} from 'lucide-react';
import { useRouter } from "next/navigation";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import moment from 'moment';
import Link from 'next/link';
import QuilView from '@/components/common/quilleview';
import CancelBtn from '@/components/cancelBtn';
import ConfirmDelete from './confirmDelete';

export default function List() {

    const router = useRouter();
    const [data, setData] = useState([]);
    const [loadState, setLoadState] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("")    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {   
       
        init();

    }, []);


    
    const init = async ()=>{

        setLoadState("loading")     

        try{                             
          
            const ret =  await callApi("/highlights") 
            if (ret.status==200){                
                setData(ret.data)                        
                setLoadState("")
            }else{              
                    setErrorMessage(ret.message)
                    setLoadState("")
            }

        }catch(err){
            console.log(err)
            setLoadState("")
        }        
    }

    const handleEdit = (row)=>{    
        router.push("/news-and-updates/" + row._id);       
    }

    const handleDelete = async(row)=>{    
        setSelectedData(row)
        setShowDeleteModal(true);
    }

    const handleSuccessDelete = async()=>{    
        setShowDeleteModal(false);
        setSelectedData(null);
        init();
    }

   
    
    const renderView = (row)=>{
        return (
            <div className='w-full'>      
                <div className='text-sm px-1 text-gray-500 mb-1'>{moment(row.transdate).fromNow()}</div>          
                <QuilView 
                    value={row.headline}                
                    readOnly={true}                
                />              
                <QuilView 
                    value={row.content}                
                    readOnly={true}                
                />      
                    
                <div className='flex justify-start gap-2 mt-2 '>
                    <CancelBtn type="button"onClick={()=>handleEdit(row)}>Edit</CancelBtn>
                    <CancelBtn type="button"onClick={()=>handleDelete(row)}>Delete</CancelBtn>
                </div>
                
            </div>
        )
    }

    const columns = [
        {
            name: "",
            selector: row => renderView(row),      
            wrap: true      
        }           
    ];

    
    var errorBox = null
    if (errorMessage) {
        errorBox =  <div className='w-full lg:w-3xl'>                 
                        <div className="my-2 flex gap-2 bg-[#e12d2d47] p-2 rounded-sm px-4">
                            <TriangleAlert  className="h-4 w-4 text-red-600" strokeWidth={2} />
                            <span className="text-sm font-bold text-red-600">{errorMessage}</span>
                        </div> 
                    </div>
                   
                    
    }


    let content = <PreLoader />;
    if (loadState == "") {
        content =  <div className="mt-4">
                        <DataTable
                                noHeader
                                noTableHead
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100, 200, 250]}
                                columns={columns}
                                data={data}
                                noDataComponent={<NoRecord/>}
                                customStyles={customStyles}
                            />
                </div>   
    }


    return (
      <div className="h-full bg-white rounded-xl p-6 border border-gray-100  w-full lg:w-4xl">       
        <div className='flex justify-start'>                                                      
            <Link href="/news-and-updates/new" className="flex items-center justify-center p-2 px-6 font-medium text-white rounded-full bg-brand-500 text-base hover:bg-brand-600">Create New News/Update</Link>            
        </div>        
        {content} 
        <ConfirmDelete open={showDeleteModal} 
                onCloseModal={()=>setShowDeleteModal(false)} 
                onDeleteSuccess={handleSuccessDelete}
                data={selectedData}/>     
    </div>
    );
}




const customStyles = {
    rows: {
        style: {
            fontSize: "15px",            
            // minHeight: '50px',
            color: "#404a60",  
            paddingTop: '16px',  
            paddingBottom: '16px',              
            opacity: 0.9,
             '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: "#e5e7ebad"
            },
            overflow: "visible !important"
        }
    },
    headRow: {
        style: {
            borderBottomColor: "#e5e7eb"
        }
    },
    headCells: {
        style: {
            fontSize: "15px",
            fontWeight: "800",
            paddingTop: '8px',  
            paddingBottom: '8px',  
            backgroundColor: "#4371e90d",
            color: "#404a60"            
        }
    },
    cells: {
        style: {
            padding: '0px 6px',            
            backgroundColor: "#fff"          
        },
     
    },
    pagination: {
        style: {
            backgroundColor: "#fff",
          

        }
    },
    noData: {
        style: {
            backgroundColor: "#fff",
            color: "#fff"
        }
    }
};