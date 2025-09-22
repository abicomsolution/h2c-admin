

import { Loader2  } from "lucide-react"

export default function SecondaryBtn(props) {

    const { id, isLoading, isDisabled, classNames, type, onClick } = props
   
    var loaderBtn = null
    if (isLoading) {
        loaderBtn = <Loader2 className="mr-1 h-6 w-6 animate-spin" />
    }

    const handleClick = ()=>{
        try{
            if (onClick){
                onClick()
            }            
        }catch(err){
            console.log(err)
        }
    }

    return (
         <button id={id} type={type} disabled={isLoading || isDisabled}  className={`btn-secondary px-5 ${classNames}`} onClick={handleClick}>
            {loaderBtn}
            {props.children}
         </button>
    );

}