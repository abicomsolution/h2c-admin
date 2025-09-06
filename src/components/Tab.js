import Link from "next/link"
import { usePathname } from "next/navigation"


export default function Tab(props) {

    const pathname = usePathname()

    const { link, title, icon } = props

    const isActive = pathname===link

    var classN = "inline-block text-base p-3 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
    if (isActive){
        classN = "inline-block text-base p-3 text-[#1f2632] font-bold border-b-2 border-[#fec41d] rounded-t-lg active"
    }

    return (
        <li className="me-2">                     
            <Link href={link} className={classN}>              
                {title}
            </Link>        
        </li>
        
    );
  }
  