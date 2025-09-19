
"use client"
import { useState, useEffect } from 'react'
import { Checkbox, Label } from "flowbite-react";
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import Select from 'react-select'
import toast, { Toaster } from 'react-hot-toast';
import callApi from "@/utils/api-caller";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const controlStyle = {    
    menuPortal: provided => ({ ...provided, zIndex: 9999 }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
    control: (baseStyles, state) => ({
        ...baseStyles,      
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "4px",
        paddingBottom: "4px",
        borderRadius: "20px"
    }),
  
}

const tmpForm = {
    minimum_withdrawal: 0,
    admin_fee: 0,
    is_admin_fee_percent: false,
    tax: 0,
    is_tax_percent: false,
    payout_sched: null
}

const tmpPS = [
    { value: 0, label: "Monday" },
	{ value: 1, label: "Tuesday" },
	{ value: 2, label: "Wednesday" },
	{ value: 3, label: "Thursday" },
	{ value: 4, label: "Friday" }	
]

export default function General(props) {

    const [ formdata, setForm ] = useState(tmpForm)
    const [scheds, setscheds] = useState(tmpPS)
    const [savestate, setsavestate] = useState("")    
    const [errorMessage, setErrorMessage] = useState("")
    const [loadstate, setloadstate] = useState("")

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        
        if (status === "unauthenticated") {
            router.replace("/login");
        }else if (status === "authenticated") {               
            init()        
        }
    
    }, [status, session, router]);


    const init = async ()=>{
        setloadstate("loading")     
        try{           
            // setTimeout(() => {
            //     setloadstate("success")
            // }, 2000);      
           
            const ret =  await callApi("/setting") 
            if (ret.status==200){     
                let newForm = {...ret.data,
                    payout_sched: scheds[ret.data.payout_sched]
                }                              
                setForm(newForm)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }
    

    const handleChange = (e)=>{
        setErrorMessage("")
        setForm({ ...formdata, [e.target.name]: e.target.value })
    }


    const handleChangeCheckAdmin = (e)=>{
        setErrorMessage("")
        setForm({ ...formdata, is_admin_fee_percent: !formdata.is_admin_fee_percent })
    }

    const handleChangeCheckTax = (e)=>{
        setErrorMessage("")
        setForm({ ...formdata, is_tax_percent: !formdata.is_tax_percent })
    }

    const handleChangeP = (e)=>{
        setErrorMessage("")
        setForm({ ...formdata, payout_sched: e })
    }

    const handleSubmit = async (e)=>{

        e.preventDefault()

        try{

            if (!formdata.minimum_withdrawal){
                setErrorMessage("Please enter minimum withdrawal.")
            }else   if (!formdata.admin_fee){
                setErrorMessage("Please enter admin fee.")
            }else   if (!formdata.tax){
                setErrorMessage("Please enter tax.")
            // }else   if (!formdata.payout_sched){
            //     setErrorMessage("Please choose minimum payout schedule.")
            }else{

                setsavestate("saving")  
                let params = {...formdata, 
                    payout_sched: 0
                }
                // payout_sched: formdata.payout_sched.value
                const ret =  await callApi("/setting/update", "POST", params) 
                if (ret.status==200){                
                    setsavestate("success")  
                    toast.success('Changes successfully saved!')
                    init()
                }else{              
                    setsavestate("failed")
                    setErrorMessage(ret.message)
                }
                
                // setsavestate("saving")      
                // setTimeout(() => {
                //     console.log(formdata)
                //     setsavestate("success")      
                //     toast.success('Changes successfully saved!')
                // }, 3000);
            }


        }catch(err){
            console.log(err)
        }        
    }


    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                   
    }

    return (
        <div className="mt-6 px-2 pl-4">        
            <form onSubmit={handleSubmit}>
                 {errorBox}
                <div className='max-w-[400px]'>                   
                    <div className=''>
                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Minimum Withdrawal <span className='text-red-500 text-xs'>*</span> </label>
                        <input
                            className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="" id="minimum_withdrawal" value={formdata.minimum_withdrawal} type="number" name='minimum_withdrawal' onChange={handleChange}/>
                    </div>
                    <div className='mt-2'>
                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Admin Fee <span className='text-red-500 text-xs'>*</span> </label>
                        <input
                            className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="" id="admin_fee" value={formdata.admin_fee} type="number" name='admin_fee' onChange={handleChange}/>
                        <div className="-mt-2 ml-2">
                            <Checkbox id="is_admin_fee_percent" checked={formdata.is_admin_fee_percent} onChange={handleChangeCheckAdmin}/>
                            <Label htmlFor="is_admin_fee_percent" className="ml-3 text-base font-medium -mt-1">
                               Is Percentage
                            </Label>
                        </div>
                    </div>
                    <div className='mt-6'>
                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Tax <span className='text-red-500 text-xs'>*</span> </label>
                        <input
                            className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="" id="tax" value={formdata.tax} type="number" name='tax' onChange={handleChange}/>
                        <div className="-mt-2 ml-2">
                            <Checkbox id="is_tax_percent" checked={formdata.is_tax_percent} onChange={handleChangeCheckTax}/>
                            <Label htmlFor="is_tax_percent" className="ml-3 text-base font-medium -mt-1">
                               Is Percentage
                            </Label>
                        </div>
                    </div>
                    
                    <div className='mt-10'>
                        <PrimaryBtn type="submit"  isLoading={savestate==="saving"}>
                            Save Changes
                        </PrimaryBtn>
                    </div>
                </div>
            </form>
            <Toaster position="top-center" reverseOrder={false}/>
        </div>
    )
}


//  <div className='mt-7'>
//                         <label className="md:text-lg font-medium block text-[#404758] mb-4">Payout Schedule <span className='text-red-500 text-xs'>*</span> </label>
//                         <Select   menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={scheds} value={formdata.payout_sched}  onChange={handleChangeP} />                            
//                     </div>