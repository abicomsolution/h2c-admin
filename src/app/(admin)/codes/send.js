import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import Process from '@/components/process';
import {  CircleCheck} from "lucide-react"
import callApi from '@/utils/api-caller';



function Send(props) {

    const { showSend, setshowSend, onCloseSuccess, user} = props
    const [qty, setqty] = useState(0)
    const [username, setusername] = useState("")
    const [verifystate, setverifystate] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [sendstate, setsendstate] = useState("")
    const [recipient, setrecipient] = useState(null)

    useEffect(()=>{

        if (showSend){
            setqty("")
            setusername("")
            setErrorMessage("")
            setverifystate("")
            setsendstate("")
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
            let params = { recipient: username, qty: qty }            
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
            let params = { recipient: recipient._id, qty: qty }            
            const ret =  await callApi("/code/send",'POST', params) 
            if (ret.status==200){     
                setverifystate("")             
                setsendstate("success")                     
            }else{
                setErrorMessage(ret.message)    
                setsendstate("")
            }
            // setTimeout(() => {
            //     setsendstate("success")
            // }, 2000);

        }catch(err){
            console.log(err)
            setErrorMessage(err.name)
        }
    }

    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                    
    }

    let content =  <ModalBody>              
                        <ModalHeader className='border-b-gray-200 pl-0'>Send Codes</ModalHeader>
                        {errorBox}
                        <div className='mt-6'>
                            <label htmlFor="username" className="md:text-lg font-medium block mb-4">Enter the username of the recipient</label>
                            <input
                                className="w-full text-sm border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="username" name="username" value={username} onChange={handleChange} type="text" maxLength={40}></input>
                        </div>      
                        <div className='mt-2'>
                            <label htmlFor="qty" className="md:text-lg font-medium block mb-4">How many codes would you like to send?</label>
                            <input
                                className="text-sm border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="qty" name="qty" value={qty} onChange={handleChangeQty} type="number" maxLength={40}></input>
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
                        <ModalHeader className='border-b-gray-200 pl-0'>Confirmation</ModalHeader>
                        {errorBox}
                        <div className='mt-6'>
                            <label className="md:text-lg font-medium block mb-4">Please confirm sending codes to:</label>
                            <input
                            className="w-full text-sm border border-[#dcdcdc] rounded-3xl disabled:bg-gray-100 disabled:text-gray-500 px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={recipient?.fullname + " - (" + recipient?.username + ")"} disabled />
                        </div>      
                        <div className='mt-2'>
                            <label className="md:text-lg font-medium block mb-4">Number of codes</label>
                            <input
                            className="w-full text-sm border border-[#dcdcdc] rounded-3xl disabled:bg-gray-100 disabled:text-gray-500 px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={qty} disabled />
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
                        <div className='flex justify-center items-center'>                
                            <CircleCheck color="#37c366" className='h-18 w-18 text-green-700' />                        
                        </div>     
                        <p className='text-center mt-4 text-xl font-semibold'>Codes successfully sent.</p>
                        <div className='flex justify-center mt-6'>
                            <PrimaryBtn type="button"  onClick={()=>onCloseSuccess()}>Close</PrimaryBtn>                            
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