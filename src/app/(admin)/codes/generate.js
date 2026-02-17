import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import Process from '@/components/process';
import {  CircleCheck} from "lucide-react"
import callApi from '@/utils/api-caller';

function Generate(props) {

    const { showGenerate, setshowGenerate, onCloseSuccess} = props
    const [qty, setqty] = useState(0)
    const [genstate, setgenstate] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isCD, setIsCD] = useState(false)

    useEffect(()=>{

        if (showGenerate){
            setqty("")
            setErrorMessage("")
            setgenstate("")
        }

    },[showGenerate])

     const handleClose = () => {        
        setshowGenerate(false)
    }


    const handleChange = (e)=>{
        setErrorMessage("")
        setqty(e.target.value)
    }

    const handleSubmit = async ()=>{
        console.log(qty)
        if (Number(qty)<=0){
            setErrorMessage("Cannot generate zero quantity.")
            return
        }

        try{

            setgenstate("process")
            const ret =  await callApi("/code",'POST',{qty: qty, isCD: isCD}) 
            if (ret.status==200){          
                setgenstate("success")                     
            }else{
                setErrorMessage(ret.message)    
                setgenstate("failed")
            }

            // setTimeout(() => {
            //     setgenstate("success")
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
                        <ModalHeader className='border-b-gray-200 pl-0'>Generate Codes</ModalHeader>
                        {errorBox}
                        <div className='mt-6'>
                            <label htmlFor="username" className="md:text-lg font-medium block mb-4">How many codes you want to generate?</label>
                            <input
                                className="text-sm border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="qty" name="qty" value={qty} onChange={handleChange} type="number" maxLength={40}></input>
                        </div>     

                        <div className="flex  gap-3 mb-4">
                            <div className="mt-4">
                                <Checkbox id="isCD" checked={isCD} onChange={() => setIsCD(!isCD)} />
                            </div> 
                            <Label htmlFor="isCD" className="md:text-lg font-medium mt-3">
                                Commission Deduction
                            </Label>
                        </div>

                        <ModalFooter className='justify-end'>                    
                            <CancelBtn onClick={handleClose}>
                                Cancel
                            </CancelBtn>
                            <PrimaryBtn type="button" onClick={handleSubmit}>
                                Generate
                            </PrimaryBtn>
                        </ModalFooter>
                    
                    </ModalBody>     
    if (genstate=="process"){
        content = <ModalBody><Process/></ModalBody>
    }else   if (genstate=="success"){
        content =  <ModalBody>
                        <div className='flex justify-center items-center'>                
                            <CircleCheck color="#37c366" className='h-18 w-18 text-green-700' />                        
                        </div>     
                        <p className='text-center mt-4 text-xl font-semibold'>Codes successfully generated.</p>
                        <div className='flex justify-center mt-6'>
                            <PrimaryBtn type="button"  onClick={()=>onCloseSuccess()}>Close</PrimaryBtn>                            
                        </div>
                    </ModalBody>
    }

    return(
        <Modal show={showGenerate}  onClose={handleClose}  >            
            {content}           
      </Modal>
    )

}


export default Generate;