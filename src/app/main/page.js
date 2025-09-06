
"use client"

import { interFont } from "./layout"

export default function Main(props) {


    return (
        <div className={`${interFont.className} h-full  w-full`}>           
             <div className="px-6">
                <div className="space-y-4 lg:flex gap-6">
                    <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Members</h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0</h4>                        
                    </div>          
                    <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Sales </h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">₱0.00</h4>                        
                    </div>    
                     <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Accumulated Commission</h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0.00</h4>                        
                    </div>    
                     <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Paid Commissions </h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0.00</h4>                        
                    </div>    
                    <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Pending Payout Request</h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0.00</h4>                        
                    </div>    
                </div>

                <div className="space-y-4 lg:flex gap-6">
                    <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Direct Referral</h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0</h4>                        
                    </div>          
                    <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Indirect Referral </h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">₱0.00</h4>                        
                    </div>    
                     <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Tax</h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0.00</h4>                        
                    </div>    
                     <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total Admin Fee </h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0.00</h4>                        
                    </div>    
                    <div className="bg-white w-full h-[150px] rounded-xl p-6">
                        <div className="border-b border-dotted border-gray-300 pb-4">
                           <h3 className="card-text-header">Total CTP</h3>                         
                        </div>
                        <h4 className="text-2xl font-bold py-4 text-[#404a60]">0.00</h4>                        
                    </div>    
                </div>
            </div>        
        </div>
    )
}