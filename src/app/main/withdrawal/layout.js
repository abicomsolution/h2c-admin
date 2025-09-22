"use client"
import React, { useEffect, useState } from "react";
import { interFont } from '../layout';
import Tab from "@/components/Tab";

export default function PayoutLayout({ children }) {

    return (
        <div className={`${interFont.className} w-full px-6`}>
            <div className="h-full bg-white rounded-xl p-6">
                
                <div className="text-lg uppercase tracking-wider font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <Tab link="/main/withdrawal" title="Pending" icon={""}/>      
                        <Tab link="/main/withdrawal/approved" title="Approved" icon={""}/>          
                        <Tab link="/main/withdrawal/rejected" title="Rejected" icon={""}/>                                    
                    </ul>
                </div>

                {children}
                
            </div>

        </div>
    )
}
