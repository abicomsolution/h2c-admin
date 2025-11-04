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
import PrimaryBtn from "@/components/primaryBtn";
import { createPortal } from 'react-dom';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmDelete from './confirm';


export default function Product(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false) 

    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [search, setsearch] = useState("")
    const [showConfirm, setshowConfirm] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null);

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
            const ret =  await callApi("/product") 
            if (ret.status==200){                
                setProducts(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }


    const searchNow = async (searchTerm)=>{
        // setloadstate("loading")     
        // try{                 
        //     const ret =  await callApi("/member/search", "POST", {search: searchTerm}) 
        //     if (ret.status==200){                
        //         setProducts(ret.data)
        //         setloadstate("success")
        //     }else{              
        //         setloadstate("")
        //     }

        // }catch(err){
        //     console.log(err)
        //     setloadstate("")
        // }
        
    }

    const handleChange = (e)=>{
        setsearch(e.target.value)
    }

    const handleDelete = ()=>{      
        setshowConfirm(false);
        toast.success("Product deleted successfully");
        init()   
        // setTimeout(() => {
        //     window.location.reload();
        // }, 2000);
    }
    
    useEffect(()=>{
        const delayDebounceFn = setTimeout(() => {
            // Send Axios request here
            if (search.length===0) {
                init()
            }else{
            searchNow(search)            
            }                
        }, 500)

        return () => clearTimeout(delayDebounceFn)

    }, [search])

    const renderCol = (row) => {

        const [open, setOpen] = React.useState(false);
        const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
        const buttonRef = React.useRef(null);
        const menuRef = React.useRef(null);

        const handleToggle = () => {
            if (!open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
            }
            setOpen((prev) => !prev);
        };


        const handleGo = (url)=>{
          
            router.push(url);   
        }

    
        const handleDelete = (row)=>{
            setshowConfirm(true);
            setSelectedProduct(row);
            setOpen(false); 
        }

        // console.log("selectedMember", row)
        // Close dropdown on outside click, but not when clicking inside the dropdown
        React.useEffect(() => {
            if (!open) return;
            function handleClick(event) {
                if (
                    buttonRef.current &&
                    !buttonRef.current.contains(event.target) &&
                    menuRef.current &&
                    !menuRef.current.contains(event.target)
                ) {
                    setOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }, [open]);

        const dropdownMenu = (
            <div
                ref={menuRef}
                className={`${interFont.className} z-[9999] absolute mt-1 w-48 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-xl focus:outline-none`}
                style={{ top: menuPosition.top, left: menuPosition.left, position: 'absolute' }}
            >
                <button className="block w-full text-left text-sky-700 font-medium px-4 py-2 hover:bg-gray-100" onClick={() => handleGo(`/main/products/${row._id}`)}>Edit</button>
                <button className="block w-full text-left text-sky-700 font-medium px-4 py-2 hover:bg-gray-100" onClick={() => handleDelete(row)}>Delete</button>
            </div>
        );

        return (
            <div className={`${interFont.className} relative inline-block text-left w-full`}>
                <button
                    ref={buttonRef}
                    className="bg-blue-600 text-white px-2 py-2 rounded-full shadow  w-full"
                    onClick={handleToggle}
                    type="button"
                >
                    Action
                </button>
                {open && typeof window !== 'undefined' && createPortal(dropdownMenu, document.body)}
            </div>
        );
    }

    let content = <PreLoader/>

    const columns = [
        {
            name: "",
            cell: row => renderCol(row),         
            width: "120px",
        },
        {
          	name: 'Code',
            selector:  row => row.code,
            width: "120px",    
            sortable: true        
        },
        {
            name: 'Product Name',
            selector:  row => row.productname,
            sortable: true,
            width: "300px",                    
        },
        {
            name: 'Category',
            selector:  row => row.category_id?.name,
            width: "200px",    
            sortable: true        
        },
       {
			name: 'UOM',
            selector:  row => row.uom,			
			sortable: true
		},
		{
			name: 'Price(SRP)',			
			right: 'true',			
			sortable: true,
			selector: row => <p className="mb-0">{Number(row.price || 0).toLocaleString('en', {minimumFractionDigits: 2})}</p>
		},
        {
			name: "Member's Price",			
			right: 'true',			
			sortable: true,
			selector: row => <p className="mb-0">{Number(row.member_price || 0).toLocaleString('en', {minimumFractionDigits: 2})}</p>
		},
        {
			name: "Hub's Price",			
			right: 'true',		
			sortable: true,
			selector: row => <p className="mb-0">{Number(row.hub_price || 0).toLocaleString('en', {minimumFractionDigits: 2})}</p>
		},
         {
			name: "Is Package",			
			right: 'true',		
			sortable: true,
			selector: row => <p className="mb-0">{row.isProdPackage ? "Yes" : "No"}</p>
		},
        
    ];

    if (loadstate==="success"){
        content =  <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={products}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                    />
    }

   
    return (
        <div className={`${interFont.className} w-full px-6`}>                    
            <div className="h-full bg-white rounded-xl p-6 ">
                 <div className="md:flex justify-between">              
                    <div className="border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-4 relative mt-2">
                        <input className="w-11/12 text-sm bg-transparent focus:outline-none" placeholder="Search...." id="search" name="search" value={search}  type="text" onChange={handleChange}/>
                            <span className="absolute ltr:right-5 rtl:left-5 top-1/2 cursor-pointer -translate-y-1/2">
                                <Search className='h-6 w-6'/>
                            </span>
                    </div>    
                    <div className="mt-4 md:mt-0">
                        <PrimaryBtn type="button" onClick={() => router.push("/main/products/add")}>Add New Product </PrimaryBtn>                    
                    </div>                
                </div>
                {/* max-w-[800px] md:max-w-[1000px] lg:max-w-[1500px]  */}
                <div className='mt-4 w-full relative z-10'>
                    <div className='overflow-x-auto'>
                        {content}
                    </div>
                </div>
            </div>                  
            <Toaster position="top-center" reverseOrder={false}/>
            <ConfirmDelete 
                showConfirm={showConfirm} 
                setshowConfirm={setshowConfirm}
                onYes={handleDelete}
                selectedProduct={selectedProduct}
            />
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