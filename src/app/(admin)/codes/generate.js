import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import Process from '@/components/process';
import {  CircleCheck} from "lucide-react"
import callApi from '@/utils/api-caller';
import { CODETYPE } from '@/utils/constants';

function Generate(props) {

    const { showGenerate, setshowGenerate, onCloseSuccess} = props
    const [qty, setqty] = useState(0)
    const [genstate, setgenstate] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isCD, setIsCD] = useState(false)
    const [isFS, setIsFS] = useState(false)
    const [codeType, setcodeType] = useState("0")

    useEffect(()=>{

        if (showGenerate){
            setqty(1)
            setIsCD(false)
            setIsFS(false)
            setErrorMessage("")
            setgenstate("")
            setcodeType("0")
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
            const ret =  await callApi("/code",'POST',{qty: qty, isCD: isCD, isFS: isFS, codetype: Number(codeType)}) 
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
                        <ModalHeader className='border-b-gray-200 pl-0 py-2'>Generate Codes</ModalHeader>
                       
                        {errorBox}
                        <div className='mt-6 flex flex-col gap-6'>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <label htmlFor="qty" className="text-sm font-semibold text-slate-700">Quantity to generate</label>
                                <div className="mt-3">
                                    <input
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                        placeholder="Enter quantity" id="qty" name="qty" value={qty} onChange={handleChange} type="number" maxLength={40}
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
                                                onChange={(event) => {
                                                    setcodeType(event.target.value)
                                                    if (event.target.value !== "2" && event.target.value !== "3") {
                                                        setIsFS(false)
                                                    }
                                                    if (event.target.value === "1") {
                                                        setIsCD(false)
                                                    }
                                                }}
                                                className="h-4 w-4 border-slate-300 text-slate-700"
                                            />
                                            <span className="font-semibold">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <Checkbox id="isCD" checked={isCD} disabled={codeType === "1"} onChange={() => { setIsCD(!isCD); setIsFS(false); }} />
                                </div>
                                <div>
                                    <Label htmlFor="isCD" className={`text-sm font-semibold ${codeType === "1" ? "text-slate-400" : "text-slate-700"}`}>
                                        Commission Deduction
                                    </Label>
                                    <p className="mt-1 text-xs text-slate-400">Not available for BR. Enable if codes should be deducted from commissions.</p>
                                </div>
                                <div className="mt-1">
                                    <Checkbox id="isFS" checked={isFS} disabled={codeType !== "2" && codeType !== "3"} onChange={() => { setIsFS(!isFS); setIsCD(false); }} />
                                </div>
                                <div>
                                    <Label htmlFor="isFS" className={`text-sm font-semibold ${codeType !== "2" && codeType !== "3" ? "text-slate-400" : "text-slate-700"}`}>
                                        Privilege Slot
                                    </Label>
                                    <p className="mt-1 text-xs text-slate-400">Only available for Jumpstart and Basic code types.</p>
                                </div>
                            </div>
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
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                            <div className='flex justify-center items-center'>
                                <CircleCheck color="#37c366" className='h-18 w-18 text-green-700' />
                            </div>
                            <p className='mt-4 text-center text-xl font-semibold text-emerald-800'>Codes successfully generated.</p>
                            <p className='mt-2 text-center text-sm text-emerald-700'>You can now distribute them from the codes table.</p>
                            <div className='mt-6 flex justify-center'>
                                <PrimaryBtn type="button"  onClick={()=>onCloseSuccess()}>Close</PrimaryBtn>
                            </div>
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