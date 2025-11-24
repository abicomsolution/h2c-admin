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
import PrimaryBtn from "@/components/primaryBtn";
import { createPortal } from 'react-dom';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select'
import Detail from './detail';
import Confirm from './confirm'

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

const months = [
	{value:0, label: 'January'},
	{value:1, label: 'February'},
	{value:2, label: 'March'},
	{value:3, label: 'April'},
	{value:4, label: 'May'},
	{value:5, label: 'June'},
	{value:6, label: 'July'},
	{value:7, label: 'August'},
	{value:8, label: 'September'},
	{value:9, label: 'October'},
	{value:10, label: 'November'},
	{value:11, label: 'December'},
]

const initYears = () => {
    var years = []

    var dateStart = moment().add(-10, 'y')
    var dateEnd = moment()

    while (dateEnd.diff(dateStart, 'years') >= 0) {
        var yr = { value:dateEnd.format('YYYY'), label:dateEnd.format('YYYY')}
        years.push(yr)
        dateEnd.add(-1, 'year')
    }

    return years
}


export default function Unilevel(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false) 

    const router = useRouter();
    const [data, setData] = useState([]);
    const [loadstate, setloadstate] = useState("")
    
    const [selectedMonth, setselectedMonth] = useState({ value: moment().month(), label: moment().format("MMMM") })
	const [selectedYear, setselectedYear] = useState({value: moment().year(), label: moment().year()})

    const [lyears, setlyears] = useState(initYears)

    const [showDetail, setshowDetail] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null);
    
    const [showConfirm, setshowConfirm] = useState(false)
    const [isProcessed, setisProcessed] = useState(false)

    useEffect(() => {
    
        if (session.status === "unauthenticated") {
            router.replace("/login");
        }else if (session.status=="authenticated"){                 
            setinitialized(true)                
        }
    
    }, [session])


    useEffect(() => {
        
        if (initialized){        
            init({ month: selectedMonth.value, year: selectedYear.value })
        }
        
    }, [initialized, selectedMonth, selectedYear]);


    const init = async (params)=>{
        setloadstate("loading")     
        try{                 
            const ret =  await callApi("/unilevel", "POST", params) 
            if (ret.status==200){                
                setData(ret.data)
                let processed = ret.data.filter(x=>x.status==1).length
                setisProcessed(processed > 0)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

            // setTimeout(() => {
            //       setloadstate("success")
            // }, 2000);

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }



    const handleProcess = async ()=>{
        setshowConfirm(true)
    }
    
   
    const handleChangeMonth = (selectedOption) => {
        setselectedMonth(selectedOption);		
    }

    const handleChangeYear = (selectedOption) => {
        setselectedYear(selectedOption);		
    }

    const handleProcessSuccess = async ()=>{
        setshowConfirm(false)
        toast.success("Unilevel processed successfully!")
        init({ month: selectedMonth.value, year: selectedYear.value })
    }

    const renderCol = (row) => {

        const handleView =()=>{
            setSelectedMember(row)
            setshowDetail(true) 
        }
       
        return (
             <button className="bg-blue-600 text-white px-6 py-2 rounded-full shadow "
                onClick={handleView} type="button">
                    View Details
                </button>
        );
    }

    let content = <PreLoader/>

    const columns = [
              
        {
            name: 'Name',
            selector:  row => row.member_id.fullname + " (" + row.member_id.username + ")",
            sortable: true,                    
        },
        {
            name: 'Personal Orders',			
            right: 'true',			
            sortable: true,
            selector: row => Number(row.personalsales || 0).toLocaleString('en', {minimumFractionDigits: 2})
        },
        {
            name: 'Group Sales',			
            right: 'true',			
            sortable: true,
            selector: row => Number(row.groupsales || 0).toLocaleString('en', {minimumFractionDigits: 2})
        }, 
        {
            name: 'Unilevel',			
            right: 'true',			
            sortable: true,
            selector: row => Number(row.unilevel || 0).toLocaleString('en', {minimumFractionDigits: 2})
        },
          {
            name: 'Status',			
            center: 'true',
            sortable: true,
            width: "160px",
            selector: row => row.status==1?row.ispaid==1?<p className='text-white bg-green-400 px-4 py-1 text-sm rounded-full'>Paid</p>:<p className='text-white bg-red-400 px-4 py-1 text-sm rounded-full'>Not Paid</p>:<p className='text-white bg-orange-400 px-4 py-1 text-sm rounded-full'>Pending</p>
        }, 
        {
            name: "",
            cell: row => renderCol(row),         
            center: true,
            width: "200px",
        },             
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
                 <div className="md:flex justify-between mt-4">              
                    <div className="flex gap-4">
                        <div className="w-[200px]">                                        
                            <Select   menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={months} value={selectedMonth}   onChange={handleChangeMonth} />                            
                        </div>
                        <div className="w-[140px]">                                        
                            <Select   menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={lyears} value={selectedYear}   onChange={handleChangeYear} />                            
                        </div>
                     </div>  
                    <div className="mt-4 md:mt-0">
                        {
                            isProcessed?<p className='text-white bg-green-400 px-4 py-1 rounded-full'>Processed</p>:
                            <PrimaryBtn type="button" onClick={handleProcess}>Process</PrimaryBtn>
                        }                                                
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
            <Detail showDetail={showDetail} setshowDetail={setshowDetail} interFont={interFont} selectedMember={selectedMember} />
            <Confirm showConfirm={showConfirm} 
                     setshowConfirm={setshowConfirm} 
                     interFont={interFont} 
                     selectedMonth={selectedMonth} 
                     selectedYear={selectedYear}
                     onYes={handleProcessSuccess} />
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