
"use client"
import { useState, useEffect, useRef } from 'react';
import logo from "../../assets/logo250.png";
import logo72 from "../../assets/logo_72.png";
import Link from "next/link";
import Image from "next/image";
import SidebarLink from "@/components/sidebarLink"
import { usePathname } from "next/navigation"
import { PageTitleProvider, usePageTitle } from "@/provider/PageTitleProvider"
import {
  LayoutDashboard,
  Receipt,
  Network,
  Wallet,
  Users,
  UserRoundSearch,
  LogOut,
  Tags,
  ChevronDown,
  CircleUserRound,
  Users2,
  Package,
  Truck
} from "lucide-react"

import UserPic from '../../assets/rom.jpg'
import { useRouter } from "next/navigation";
import { Inter, Raleway } from "next/font/google";
import SidebarLogout from '@/components/sidebarLogout';
import { signOut } from "next-auth/react";

export const interFont = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: ["400", "500", "600", "700"], // optional
});




// console.log(interFont)
function MainLayoutContent(props) {

    const pathname = usePathname();
    const router = useRouter();    
    const { pageTitle } = usePageTitle();

    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const userMenuRef = useRef(null);

    useEffect(() => {

        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        }
        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);


    const handleSignout = ()=>{
        signOut({callbackUrl: "/login", redirect: true})
    }

    const handleMenuClick = (url) => {
        router.push(url);
        setUserMenuOpen(false);
    }

    console.log("Layout pageTitle:", pageTitle);
    console.log("Current pathname:", pathname);

    return(
        <>
            <div className={`${interFont.className} grid min-h-screen w-full overflow-x-hidden md:grid-cols-[280px_1fr] lg:grid-cols-[330px_1fr]`}>  
                <div id="sidebar" className="hidden  md:block">
                    <div className="flex h-full flex-col gap-2">
                        <div className="p-2 mt-4 relative">
                            {/* <div className="absolute top-0 left-0 pl-4">
                                <Image alt="H2c" src={logo72.src} width={72} height={47} />
                            </div> */}
                            <div className="flex justify-center w-full">
                                <Image alt="H2c" src={logo.src} width={150} height={139} className="rounded-full"/>
                            </div>
                            <p className="font-semibold text-xl pt-2 text-center text-white">Admin Portal</p>
                            
                        </div>
                        <div className="px-4 h-1 w-full border-b border-[#e8e8e8] "></div>
                         <div className="flex-1 mt-4">
                            <nav className="px-2 text-sm font-medium lg:px-6 space-y-1">
                                <SidebarLink link="/main" title="Dashboard" currentPath={pathname}  icon={<LayoutDashboard className="h-4 w-4"/>}/>       
                                <SidebarLink link="/main/members" title="Members" currentPath={pathname} icon={<Users2 className="h-4 w-4"/>}/>       
                                <SidebarLink link="/main/genealogy" title="Genealogy" currentPath={pathname} icon={<Network className="h-4 w-4" />} />                                             
                                <SidebarLink link="/main/codes" title="Codes" currentPath={pathname} icon={<Wallet className="h-4 w-4" />} />                                             
                                <SidebarLink link="/main/withdrawal" title="Withdrawal" currentPath={pathname} icon={<Tags className="h-4 w-4" />} />
                                <SidebarLink link="/main/products" title="Products" currentPath={pathname} icon={<Package className="h-4 w-4" />} />
                                <SidebarLink link="/main/orders" title="Orders" currentPath={pathname} icon={<Truck className="h-4 w-4" />} />
                                <SidebarLink link="/main/transactions" title="Transactions" currentPath={pathname} icon={<Users className="h-4 w-4" />} />
                                <SidebarLink link="/main/settings" title="Settings" currentPath={pathname} icon={<UserRoundSearch className="h-4 w-4" />} />                                     
                                <SidebarLogout title="Signout" icon={<LogOut className="h-4 w-4" />} onClick={handleSignout} />                                                      
                            </nav>
                         </div>
                    </div>
                </div>
                 <div className="bg-[#54565514]">    
                     <div className="flex justify-between">
                        <div className="flex-1 space-y-4 p-4 pt-2 md:p-6">
                            <div className="flex items-center justify-between space-y-2">
                                <h2 className={`text-[#404a60] text-3xl font-bold tracking-tight`}>
                                {pageTitle}
                                </h2>    
                            </div>
                        </div>                                           
                        <div className="flex justify-end items-center px-6">
                            <div className="px-4">
                                <button className="bg-white text-[#888383] py-2 px-4 rounded-full"
                                        id="user-menu-button"
                                        aria-expanded={userMenuOpen}
                                        onClick={() => setUserMenuOpen((prev) => !prev)}>
                                        <div className='flex gap-2'>
                                            <CircleUserRound className="h-6 w-6" />
                                            <span>Admin</span>
                                            <ChevronDown className="h-4 w-4 mt-1" />
                                        </div>                                            
                                </button>                                
                            </div>                           
                         <div
                                ref={userMenuRef}
                                className={`z-50 ${userMenuOpen ? '' : 'hidden'} my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm  absolute right-12 top-12`}
                                id="user-dropdown"
                            >
                                <div className="px-4 py-3">
                                    <span className="block  text-gray-900 dark:text-white">John Meyer</span>
                                    <span className="block  text-gray-500 truncate dark:text-gray-400">jonhn@gmail.com</span>                                   
                                </div>
                                <ul className="py-2" aria-labelledby="user-menu-button">
                                    <li>
                                    <a href="#" className="block px-4 py-2 text-base text-[#404a60] hover:bg-gray-100" onClick={() => handleMenuClick("/profile")}>Profile</a>
                                    </li>
                                    <li>
                                    <a href="#" className="block px-4 py-2 text-base text-[#404a60] hover:bg-gray-100" onClick={() => handleMenuClick("/borrow")}>Change Password</a>
                                    </li>
                                    <li>
                                    <a href="#" className="block px-4 py-2 text-base text-[#404a60] hover:bg-gray-100" onClick={() => handleMenuClick("/lend")}>Payout Info</a>
                                    </li>
                                    <li>
                                    <a href="#" className="block px-4 py-2 text-base text-[#404a60] hover:bg-gray-100" onClick={handleSignout}>Sign out</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {props.children}                  
                 </div>
            </div>
        </>
    )


}


function MainLayout(props) {
    return (
        <PageTitleProvider>
            <MainLayoutContent {...props} />
        </PageTitleProvider>
    );
}


export default MainLayout