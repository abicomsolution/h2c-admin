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
// Removed Dropdown, DropdownItem import
import { createPortal } from 'react-dom';
import ConfirmHub from '../members/confirmHub';
import toast, { Toaster } from 'react-hot-toast';
import { HUBTYPE } from '@/utils/constants';
import ConfirmUpgrade from './confirmUpgrade';

export default function Members(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false) 

    const router = useRouter();
    const [members, setMembers] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [search, setsearch] = useState("")
    const [showPromoteHub, setshowPromoteHub] = useState(false)
    const [selectedMember, setselectedMember] = useState(null)
    const [showConfirmUpgrade, setShowConfirmUpgrade] = useState(false)
    
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


    const searchNow = async (searchTerm)=>{
        setloadstate("loading")     
        try{                 
            const ret =  await callApi("/member/search", "POST", {search: searchTerm}) 
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
        setsearch(e.target.value)
    }

    
    const handleConfirmHub = ()=>{
        setshowPromoteHub(false)
        toast.success('Member successfully promoted to Hub!')
        setTimeout(() => {
            window.location.reload();    
        }, 2000);
        
    }

    const handleConfirmUpgrade = ()=>{
        setShowConfirmUpgrade(false)
        toast.success('Member successfully upgraded to Paid!')
        searchNow(search)
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

        const handlePromoteHub = (row)=>{
          setselectedMember(row)
          setOpen(false)
          setshowPromoteHub(true)
         
        }

        const handleUpgradeToPaid = (row)=>{
            setselectedMember(row)
            setOpen(false)
            setShowConfirmUpgrade(true)
        }

        console.log("selectedMember", row)
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
                <button className="block w-full text-left text-sky-700 font-medium px-4 py-2 hover:bg-gray-100"  onClick={()=>handleGo("/main/profile?id="+row._id)}>Edit Profile</button>
                <button className="block w-full text-left text-sky-700 font-medium px-4 py-2 hover:bg-gray-100" onClick={()=>handlePromoteHub(row)}>Promote to Hub</button>
                {
                    row.isCd && !row.cdPaid && <button className="block w-full text-left text-sky-700 font-medium px-4 py-2 hover:bg-gray-100" onClick={()=>handleUpgradeToPaid(row)}>Upgrade to Paid</button>
                }
                
                <button className="block w-full text-left text-gray-300 font-medium px-4 py-2 hover:bg-gray-100">Suspend</button>                
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
        },
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
            width: "250px",                       
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
         {
            name: "Is Hub",
            selector:  row => row.isHub?HUBTYPE[row.hubtype]:"No",
            width: "250px",                   
            sortable: true        
        }
        
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
                        <input className="w-11/12 text-sm bg-transparent focus:outline-none" placeholder="Search...." id="search" name="search" value={search}  type="text" onChange={handleChange}/>
                            <span className="absolute ltr:right-5 rtl:left-5 top-1/2 cursor-pointer -translate-y-1/2">
                                <Search className='h-6 w-6'/>
                            </span>
                    </div>                    
                </div>
                <div className='mt-4 max-w-[800px] md:max-w-[1000px] lg:max-w-[1500px] relative z-10'>
                    <div className='overflow-x-auto'>
                        {content}
                    </div>
                </div>
            </div>        
            <ConfirmHub showConfirm={showPromoteHub} setshowConfirm={setshowPromoteHub} onYes={handleConfirmHub} selectedMember={selectedMember}/>   
            <ConfirmUpgrade showConfirm={showConfirmUpgrade} setshowConfirm={setShowConfirmUpgrade} onYes={handleConfirmUpgrade} selectedMember={selectedMember}/>   
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