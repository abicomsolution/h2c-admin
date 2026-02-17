"use client"
import React, { useEffect, useState } from "react";
import Tab from "@/components/Tab";

export default function SettingsLayout({ children }) {

    return (
        <div className={`w-full px-6`}>
            <div className="h-full bg-white rounded-xl p-6">
                
                <div className="text-lg uppercase tracking-wider font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <Tab link="/settings" title="General" icon={""}/>      
                        <Tab link="/settings/payoutmethod" title="Payout Method" icon={""}/>        
                        <Tab link="/settings/product-category" title="Product Category" icon={""}/>                                        
                    </ul>
                </div>

                {children}
                
            </div>

        </div>
    )
}
