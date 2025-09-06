

export default function CancelBtn(props) {

    const { classNames,  onClick } = props
   

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
         <button type="button" className={`btn-cancel px-5 ${classNames}`} onClick={handleClick}>         
            {props.children}
         </button>
    );

}