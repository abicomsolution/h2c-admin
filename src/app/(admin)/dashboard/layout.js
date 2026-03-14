"use client"
import React, { useEffect, useState } from "react";
import Tab from "@/components/Tab";

export default function DashboardLayout({ children }) {

    return (
        <div className={`w-full`}>
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Performance overview</h2>
                    <p className="mt-1 text-sm text-slate-500">Live totals for member activity, sales, and commissions.</p>
                </div>                   
            </div>
            <div className="h-full bg-white rounded-xl p-6 pt-1">                
                <div className="text-lg uppercase tracking-wider font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <Tab link="/dashboard" title="2.0 Dashboard" icon={""}/>                    
                        <Tab link="/dashboard/v1" title="1.0 Dashboard" icon={""}/>                
                    </ul>
                </div>
                {children}
            </div>

        </div>
    )
}
