import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import Process from '@/components/process';
import {  CircleCheck} from "lucide-react"
import callApi from '@/utils/api-caller';
import { CODETYPE } from '@/utils/constants';


function Send(props) {

    const { showSend, setshowSend, onCloseSuccess, user} = props
    const [qty, setqty] = useState("1")
    const [username, setusername] = useState("")
    const [verifystate, setverifystate] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [sendstate, setsendstate] = useState("")
    const [recipient, setrecipient] = useState(null)
    const [codeType, setcodeType] = useState("0")

    useEffect(()=>{

        if (showSend){
            setqty("1")
            setusername("")
            setErrorMessage("")
            setverifystate("")
            setsendstate("")
            setcodeType("0")
        }

    },[showSend])

     const handleClose = () => {        
        setshowSend(false)
    }


    const handleChange = (e)=>{
        setErrorMessage("") 
        setusername(e.target.value)
    }

    const handleChangeQty = (e)=>{
        setErrorMessage("") 
        setqty(e.target.value)
    }

    const handleBack = ()=>{
         setErrorMessage("") 
        setverifystate("")
    }

    const handleSubmit = async ()=>{
       
         
        if (!username.trim()){
            setErrorMessage("Username of the recipient cannot be blank.")
            return
        }else if (Number(qty)<=0){
            setErrorMessage("Cannot send zero quantity.")
            return
        }

        try{
            setErrorMessage("")    
            setverifystate("verify")            
            let params = { recipient: username, qty: qty, codetype: Number(codeType) }            
            const ret =  await callApi("/code/verify",'POST', params) 
            if (ret.status==200){    
                setrecipient(ret.data)      
                setverifystate("success")                     
            }else{
                setErrorMessage(ret.message)    
                setverifystate("failed")
            }
          
        }catch(err){
            console.log(err)
            setErrorMessage(err.name)
        }
    }

     const handleConfirm= async ()=>{
               
        try{
            setErrorMessage("")                
            setsendstate("send")
            let params = { recipient: recipient._id, qty: qty, codetype: Number(codeType) }            
            const ret =  await callApi("/code/send",'POST', params) 
            if (ret.status==200){     
                setverifystate("")             
                setsendstate("success")                     
            }else{
                setErrorMessage(ret.message)    
                setsendstate("")
            }

        }catch(err){
            console.log(err)
            setErrorMessage(err.name)
        }
    }

    const selectedTypeLabel = CODETYPE.find(t => t.value === Number(codeType))?.label || ""

    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                    
    }

    let content =  <ModalBody>              
                        <ModalHeader className='border-b-gray-200 pl-0 py-2'>Send Codes</ModalHeader>
                        {errorBox}
                        <div className='mt-6 flex flex-col gap-6'>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <label htmlFor="username" className="text-sm font-semibold text-slate-700">Recipient username</label>
                                <div className="mt-3">
                                    <input
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                        placeholder="Enter username" id="username" name="username" value={username} onChange={handleChange} type="text" maxLength={40}
                                    />
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-sm font-semibold text-slate-700">Code type</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    {CODETYPE.map((item) => (
                                        <label key={item.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 transition hover:border-slate-300">
                                            <input
                                                type="radio"
                                                name="codeType"
                                                value={String(item.value)}
                                                checked={codeType === String(item.value)}
                                                onChange={(event) => setcodeType(event.target.value)}
                                                className="h-4 w-4 border-slate-300 text-slate-700"
                                            />
                                            <span className="font-semibold">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <label htmlFor="qty" className="text-sm font-semibold text-slate-700">Quantity to send</label>
                                <div className="mt-3">
                                    <input
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                        placeholder="Enter quantity" id="qty" name="qty" value={qty} onChange={handleChangeQty} type="number" maxLength={40}
                                    />
                                </div>
                            </div>
                        </div>

                        <ModalFooter className='justify-end'>                    
                            <CancelBtn onClick={handleClose}>
                                Cancel
                            </CancelBtn>
                            <PrimaryBtn type="button" onClick={handleSubmit}>
                                Continue
                            </PrimaryBtn>
                        </ModalFooter>
                    
                    </ModalBody>     
    if (verifystate=="verify" || sendstate=="send"){
        content = <ModalBody><Process/></ModalBody>    
    } else if (verifystate=="success"){
        content =  <ModalBody>              
                        <ModalHeader className='border-b-gray-200 pl-0 py-2'>Confirmation</ModalHeader>
                        {errorBox}
                        <div className='mt-6 flex flex-col gap-5'>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Recipient</p>
                                <p className="mt-1 text-sm font-semibold text-slate-700">{recipient?.fullname} <span className="font-normal text-slate-500">({recipient?.username})</span></p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Code Type</p>
                                <p className="mt-1 text-sm font-semibold text-slate-700">{selectedTypeLabel}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Quantity</p>
                                <p className="mt-1 text-sm font-semibold text-slate-700">{qty}</p>
                            </div>
                        </div>

                        <ModalFooter className='justify-end'>                    
                            <CancelBtn onClick={handleBack}>
                                Back
                            </CancelBtn>
                            <PrimaryBtn type="button" onClick={handleConfirm}>
                                Confirm
                            </PrimaryBtn>
                        </ModalFooter>                
                </ModalBody>

    }else if (sendstate=="success"){
        content =  <ModalBody>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                            <div className='flex justify-center items-center'>
                                <CircleCheck color="#37c366" className='h-18 w-18 text-green-700' />
                            </div>
                            <p className='mt-4 text-center text-xl font-semibold text-emerald-800'>Codes successfully sent.</p>
                            <p className='mt-2 text-center text-sm text-emerald-700'>The recipient can now use the codes.</p>
                            <div className='mt-6 flex justify-center'>
                                <PrimaryBtn type="button"  onClick={()=>onCloseSuccess()}>Close</PrimaryBtn>
                            </div>
                        </div>
                    </ModalBody>
    }

    return(
        <Modal show={showSend}  onClose={handleClose} >            
            {content}           
      </Modal>
    )

}


export default Send;