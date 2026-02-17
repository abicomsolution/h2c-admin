"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { PageTitleProvider } from "@/context/PageTitleProvider";

function  AdminLayoutContent(props) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    // Dynamic class for main content margin based on sidebar state
    const mainContentMargin = isMobileOpen
        ? "ml-0"
        : isExpanded || isHovered
        ? "lg:ml-[270px]"
        : "lg:ml-[90px]";

    return (
        <div className="min-h-screen xl:flex">
            <AppSidebar />
             <div className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}>
                {/* Header */}
                <AppHeader />            
                <div className="p-2 mx-auto max-w-(--breakpoint-3xl) md:p-4">{props.children}</div>
            </div>
        </div>
    );
}



function MainLayout(props) {
    return (
        <PageTitleProvider>
            <AdminLayoutContent {...props} />
        </PageTitleProvider>
    );
}
export default MainLayout;