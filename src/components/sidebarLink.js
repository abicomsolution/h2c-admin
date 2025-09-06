import Link from "next/link"
import { Home } from "lucide-react"

import { interFont } from "../app/main/layout"
    
export default function SidebarLink(props) {

    const { link, currentPath, title, icon} = props

    
    const isActive = currentPath===link

    var classN = "flex items-center gap-3 rounded-lg px-3 py-3 text-base text-[#fff] transition-all hover:text-[#fff] hover:bg-[#51749647]"
    if (isActive){
        classN = "flex text-base items-center gap-3 rounded-lg  px-3 py-3 transition-all text-white bg-[#517496]"
    }


    return (
        <Link href={link} className={`${interFont.className} ${classN}`}>            
            { icon?icon: ""}       
            {title}
        </Link>
    );
  }
  