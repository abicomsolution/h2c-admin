import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import SecondaryBtn from '@/components/secondaryBtn';
import { interFont } from '../layout';
import { TriangleAlert } from "lucide-react";
import Process from '@/components/process';
import {  CircleCheck} from "lucide-react"
import callApi from '@/utils/api-caller';
import moment from 'moment';
import { roundToTwo } from '@/utils/functions';
import Confirm from './confirm';

function View(props) {

    const { showView, setshowView, onCloseSuccess, request, type} = props  
    const [errorMessage, setErrorMessage] = useState("")    
    const [showConfirm, setshowConfirm] = useState(false)
    const [processState, setprocessState] = useState("")   
    const [ptype, setptype]  = useState(0)

    useEffect(()=>{

        if (showView){            
            setErrorMessage("")            
        }

    },[showView])

     const handleClose = () => {        
        setshowView(false)
    }


    // console.log(request)

    const handleApprove = async ()=>{
        setptype(1)
        setshowConfirm(true)
        setErrorMessage("")     
    }

     const handleReject = async ()=>{
        setptype(0)
        setshowConfirm(true)
        setErrorMessage("")      
    }

    
    const rejectRequest = async ()=>{

        try{
            setshowConfirm(false)
            setErrorMessage("")                
            setprocessState("reject")
            let params = { id: request._id }    
            console.log(params)        
            const ret =  await callApi("/payout/reject",'POST', params) 
            if (ret.status==200){     
                setprocessState("success")
                onCloseSuccess(0)             
            }else{
                setErrorMessage(ret.message)    
                setprocessState("")
            }
          
            // setTimeout(() => {
            //     setprocessState("success")
            //     onCloseSuccess(ptype)
            // }, 2000);

        }catch(err){
            console.log(err)
            setErrorMessage(err.name)
        }
    }

    const approveRequest = async ()=>{
        try{
            setshowConfirm(false)
            setErrorMessage("")                
            setprocessState("approve")

            let params = { id: request._id}    
            console.log(params)        
            const ret =  await callApi("/payout/approve",'POST', params) 
            if (ret.status==200){     
                setprocessState("success")
                onCloseSuccess(1)             
            }else{
                setErrorMessage(ret.message)    
                setprocessState("")
            }

        }catch(err){
            console.log(err)
            setErrorMessage(err.name)
        }
    }


    const handleYes = async ()=>{
        
        if (ptype==1){
           await approveRequest()            
        }else{
            await rejectRequest()            
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
                        <ModalHeader className='border-b-gray-200 pl-0'>Withdrawal Request</ModalHeader>
                        {errorBox}
                        <div className='mt-2 px-2'>
                            <div className='grid grid-cols-[200px_1fr] gap-1'>
                                <div>
                                    <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block">Date/Time:</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Member:</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Payout Method:</p>
                                    </div>
                                     <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Account Name:</p>
                                    </div>
                                     <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Account/Mobile #:</p>
                                    </div>
                                     <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Amount:</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Tax:</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Admin Fee:</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3 text-[#404a60]'>
                                        <p className="md:text-lg font-medium block ">Net:</p>
                                    </div>
                                </div>
                                <div>
                                    <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block">{moment(request.transdate).format("MMM-DD-YYYY hh:mm A")}</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{request.member_id.fullname} - ({request.member_id.username})</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{request.paymethod.name}</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{request.accountname}</p>
                                    </div>
                                     <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{request.accountno}</p>
                                    </div>
                                     <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{Number(roundToTwo(request.amount)).toLocaleString('en', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{Number(roundToTwo(request.tax)).toLocaleString('en', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{Number(roundToTwo(request.adminfee)).toLocaleString('en', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div className='border-b border-gray-200 py-3'>
                                        <p className="md:text-lg font-medium block ">{Number(roundToTwo(request.net)).toLocaleString('en', {minimumFractionDigits: 2})}</p>
                                    </div>
                                </div>
                            </div>
                            {/* <input
                                className="w-full text-sm border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="username" name="username" value={username} onChange={handleChange} type="text" maxLength={40}></input> */}
                        </div>      
                
                        <ModalFooter className='justify-between px-2'>                    
                            <CancelBtn onClick={handleClose}>
                                Cancel
                            </CancelBtn>
                            <div className='flex gap-2'>
                                <SecondaryBtn type="button" onClick={handleReject} isLoading={processState==="reject"}>
                                    Reject
                                </SecondaryBtn>
                                <PrimaryBtn type="button" onClick={handleApprove} isLoading={processState==="approve"}>
                                    Approve
                                </PrimaryBtn>
                            </div>
                        </ModalFooter>
                    
                    </ModalBody>     
   

    return(
        <Modal show={showView}  onClose={handleClose} size="3xl" >            
            {content}           
            <Confirm showConfirm={showConfirm} setshowConfirm={setshowConfirm} onYes={handleYes} ptype={ptype}/>
           
      </Modal>
    )

}


export default View;