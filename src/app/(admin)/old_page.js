"use client"
import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PreLoader from '@/components/preloader';
import callApi from "@/utils/api-caller";
import { roundToTwo } from "@/utils/functions";

import { interFont } from "./layout"

const tmpData = {
    member: 1,
    tsales: 2,
    com_accumlated: 3,
    com_paid: 4,
    com_pending: 5,
    direct: 6,
    indirect: 7,
    ctp: 8,
    royalty: 9,
    unilevel: 10,
    tax: 11,
    adminfee: 12,    
    usedcodes: 0,
    unused_codes: 0,
    cd_codes: 0,
    cd_usedcodes: 0,  
    cd_unusedcodes: 0    
}

export default function Main(props) {

    const { data: session, status } = useSession();

    const router = useRouter();    
    const [loadstate, setloadstate] = useState("")
    const [data, setdata] = useState(tmpData)

    useEffect(() => {
        
        if (status === "unauthenticated") {
            router.replace("/login");
        }else if (status === "authenticated") {               
            init()        
        }
    
    }, [status, session, router]);
    

    const init = async (dtF, dtT)=>{
        setloadstate("loading")     
        try{           
        
            // setloadstate("success")
            // let params = {
            //     dateFrom: dtF,
            //     dateTo: dtT                
            // }
            const ret =  await callApi("/dashboard") 
            if (ret.status==200){                
                setdata(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }        
    }

    return (
        <div className={`${interFont.className} w-full`}>           
             <div className="px-6">
                <div className="space-y-4 lg:flex gap-6">
                    <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Members</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">{Number(roundToTwo(data.member)).toLocaleString('en', {minimumFractionDigits: 0})}</h4>                        
                    </div>                            
                     <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Used Paid Codes</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">{Number(roundToTwo(data.usedcodes)).toLocaleString('en', {minimumFractionDigits: 0})}</h4>                        
                    </div>    
                     <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Unused Paid Codes </h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">{Number(roundToTwo(data.unused_codes)).toLocaleString('en', {minimumFractionDigits: 0})}</h4>                        
                    </div>  
                     <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total CD Codes</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">{Number(roundToTwo(data.cd_codes)).toLocaleString('en', {minimumFractionDigits: 0})}</h4>                        
                    </div>    

                    <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Sales </h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.tsales)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>      
                </div>

                <div className="space-y-4 lg:flex gap-6">
                    <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Direct Referral</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.direct)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>          
                    <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Indirect Referral </h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.indirect)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>    
                     
                    <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total CTP</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.ctp)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>    

                     <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Leadership Royalty</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.royalty)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>   

                     <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Unilevel</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.unilevel)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>                     
                </div>
                <div className="space-y-4 lg:flex gap-6">
                      <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Accumulated Commission</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.com_accumlated)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>             
                     <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Paid Commissions </h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.com_paid)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>    

                    <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Pending Payout Request</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.com_pending)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>                      

                    <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Tax</h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.tax)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>    
                     <div className="bg-white w-full h-[140px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Admin Fee </h3>                         
                        </div>
                        <h4 className="text-xl font-bold py-4 text-[#404a60]">₱{Number(roundToTwo(data.adminfee)).toLocaleString('en', {minimumFractionDigits: 2})}</h4>                        
                    </div>                
                </div>

            </div>        
        </div>
    )
}