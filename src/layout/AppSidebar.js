"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useSession } from "next-auth/react";
import { TUSER, RANKS, HUBTYPE } from '@/utils/constants';
import UserPic from '../assets/no_photo.png'
import toast, { Toaster } from 'react-hot-toast';
import logo from "../assets/logo250.png";
import {
  LayoutDashboard,
  MoreHorizontal,
  ChevronDownIcon,
  Receipt,
  Network,
  Wallet,
  Users,
  Settings2,
  LogOut,
  Tags,
  ChevronDown,
  CircleUserRound,
  ReceiptText,
  DollarSign,
  Coins,
  Box,
  Truck,
  Newspaper
} from "lucide-react"


const navItems = [
  {
    icon: <LayoutDashboard className="h-4 w-4"/>,
    name: "Dashboard",      
    path: "/dashboard",
  },
  {
    icon: <CircleUserRound className="h-4 w-4"/>,
    name: "Members",   
    path: "/members"  
  },
  {
    icon: <Network className="h-4 w-4"/>,
    name: "Genealogy", 
    path: "/genealogy" 
  },
  {
    icon: <Tags className="h-4 w-4"/>,
    name: "Admin Codes",   
    path: "/codes",
  }, 
  {
    icon: <Coins className="h-4 w-4"/>,
    name: "Withdrawals",   
    path: "/withdrawal",
  },
  {
    icon: <Receipt className="h-4 w-4"/>,
    name: "Unilevel",   
    path: "/unilevel",
  },
  {
    icon: <Box className="h-4 w-4"/>,
    name: "Products",   
    path: "/products",
  },
  {
    icon: <Truck className="h-4 w-4"/>,
    name: "Orders",   
    path: "/orders",
  },
  {
    icon: <ReceiptText className="h-4 w-4"/>,
    name: "Transactions",   
    path: "/transactions",
  },
  {
    icon: <Newspaper className="h-4 w-4"/>,
    name: "News & Updates",   
    path: "/news-and-updates",
  },
  {
    icon: <Settings2 className="h-4 w-4"/>,
    name: "Settings",   
    path: "/settings",
  }

];

const othersItems = [ ];

const AppSidebar = () => {

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  
  const session = useSession()  
  const [userdata, setuserdata] = useState(TUSER)

  useEffect(() => {
    
        if (session.status=="authenticated"){      
            setuserdata(session.data.user)                
        }
    
  }, [session])



  console.log("Sidebar userdata", userdata)

  const renderMenuItems = (navItems,menuType) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-white"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                     
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState(null);


  const [subMenuHeight, setSubMenuHeight] = useState({});

  const subMenuRefs = useRef({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);


  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

 
  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 h-screen border-r border-slate-800/70 transition-all duration-300 ease-in-out z-50 shadow-[0_20px_50px_rgba(15,23,42,0.55)]
        ${
          isExpanded || isMobileOpen
            ? "w-[270px]"
            : isHovered
            ? "w-[270px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <div className="w-full">
            <div className="flex justify-center w-full">
                <div className="flex justify-center w-full">
                    <Image alt="H2c" src={logo.src} width={150} height={139} className="rounded-full"/>
                </div>
            </div>                         

             {
              isExpanded || isHovered || isMobileOpen ? <>         
                <p className="font-semibold text-lg pt-1 text-center text-slate-100">Admin Portal</p>                
              </>  : null
            }            
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar mt-2">
        <nav className="mb-4">
          <div className="flex flex-col gap-8">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-slate-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <MoreHorizontal />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-emerald-100 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <MoreHorizontal />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
        <Toaster position="top-center" reverseOrder={false} />
    </aside>
  );
};

export default AppSidebar;
