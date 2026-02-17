
'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"

export default function Tab2(props) {

    const pathname = usePathname()
    
    const { title, link, onClick } = props

    
    // Stay active if pathname matches or is a subroute of link
    let isActive = false;
    isActive = pathname===link;
    
    // if (link==''){
    //     isActive = pathname===link;
    // }else{
    //     isActive = pathname === link || pathname.startsWith(link + "/");
    // }


    var classN = "inline-block px-3 py-2 px-4 rounded-t-lg bg-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 whitespace-normal break-words text-center"
    if (isActive){
        classN = "inline-block px-3 py-2 px-4 rounded-t-lg  bg-white font-semibold  text-[#403315] whitespace-normal break-words text-center"
    }

    

    return (
        <li className="">            
           <Link href={link} className={classN} aria-current={isActive ? 'page' : undefined} onClick={onClick}>{title}</Link>                              
        </li>
        
    );
  }
  