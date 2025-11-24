"use client"
import React, { useEffect, useState} from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DataTable from 'react-data-table-component';
import NoRecord from '@/components/NoRecord';
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import { interFont } from '../layout';
import moment from 'moment';
import Select from 'react-select'
import { Datepicker, Button } from "flowbite-react";
import { Search } from 'lucide-react';


const opts = [
    {value: -1, label: "All"},
    {value: 0, label: "H2C Wallet"},
    {value: 1, label: "Direct Referral"},
    {value: 2, label: "Indirect Referral"},
    {value: 3, label: "CTP"},
    {value: 4, label: "Unilevel"},
    {value: 5, label: "Royalty"},
    {value: 6, label: "Transferred To Wallet"},
    
]

const controlStyle = {    
    menuPortal: provided => ({ ...provided, zIndex: 9999 }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
    control: (baseStyles, state) => ({
        ...baseStyles,      
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "4px",
        paddingBottom: "4px",
        borderRadius: "20px"
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
            const ret =  await callApi("/trans", "POST", params) 
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
            desc = "Indirect referral from " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ") - Level " + item.level
       	}else if (item.earning_type==3){
	        desc = "CTP from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
        }else if (item.earning_type==4){
	        desc = "Unilevel income -  " +  item.remarks
       	}else if (item.earning_type==5){
	        desc = "Leadership royalty from  " +  item.from_member_id.fullname + " (" + item.from_member_id.username + ")"
        }else if (item.earning_type==6){
	        desc = "Transfer direct referral to wallet"
        }else if (item.earning_type==7){
	        desc = "Transfer indirect referral to wallet"
        }else if (item.earning_type==8){
	        desc = "Transfer CTP to wallet"
        }else if (item.earning_type==9){
	        desc = "Transfer unilevel to wallet"
        }else if (item.earning_type=10){
	        desc = "Transfer leadership royalty to wallet"
        }else if (item.earning_type=12){
	        desc = "Hub royalty from  " +  item.from_membr_id.fullname + " (" + item.from_member_id.username + ")"
        }else if (item.earning_type=13){
	        desc = "Transfer hub royalty to wallet"
        }
        return desc;
    }


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
                    />
    }

   
    return (
        <div className={`${interFont.className} w-full px-6`}>                    
            <div className="h-full bg-white rounded-xl p-6 ">
                 <div className="md:flex justify-between">              
                  
                     <div className="flex gap-4">
                        <div>
                            <div className="border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-4 relative mt-2">
                                <input className="w-11/12 text-sm bg-transparent focus:outline-none" placeholder="Search...." id="search" name="search" value={search}  type="text" onChange={handleChange}/>
                                    <span className="absolute ltr:right-5 rtl:left-5 top-1/2 cursor-pointer -translate-y-1/2">
                                        <Search className='h-6 w-6'/>
                                    </span>
                            </div>     
                        </div>
                        <div className='w-[220px] mt-2'>                                                
                            <Select className='w-full'  menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={opts} value={selectCat}   onChange={handleChangeCat} />                                                    
                        </div>
                    </div>  
                  
                    <div className="flex gap-4 mt-2">
                        <Datepicker value={dateFrom} onChange={handleChangeDateFrom}/>
                        <Datepicker value={dateTo} onChange={handleChangeDateTo}/>
                    </div>                                
                </div>
                {/* max-w-[800px] md:max-w-[1000px] lg:max-w-[1500px]  */}
                <div className='mt-4 w-full relative z-10'>
                    <div className='overflow-x-auto'>
                        {content}
                    </div>
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