"use client"
import React, { useEffect, useState } from "react";
import Tab from "@/components/Tab";

export default function CodeLayout({ children }) {

    return (
        <div className={`w-full px-6`}>
            <div className="h-full bg-white rounded-xl p-6">
                
                <div className="text-lg uppercase tracking-wider font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <Tab link="/codes" title="Available Codes" icon={""}/>                    
                        <Tab link="/codes/history" title="Code History" icon={""}/>                    
                        <Tab link="/codes/used" title="Used Codes" icon={""}/>                    
                    </ul>
                </div>

                {children}
            </div>

        </div>
    )
}
