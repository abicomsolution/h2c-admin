import Link from "next/link"


import { interFont } from "../app/main/layout"
    
export default function SidebarLogout(props) {

    const { title, icon, onClick} = props


    var classN = "flex items-center gap-3 rounded-lg px-3 py-3 text-base text-[#fff] transition-all hover:text-[#83878e] hover:bg-[#e6e6e6ad] w-full"
    


    return (
        <button  className={`${interFont.className} ${classN}`} onClick={()=>onClick()}>            
            { icon?icon: ""}       
            {title}
        </button>
    );
  }
  