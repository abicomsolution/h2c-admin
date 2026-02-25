import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalHeader, ModalFooter } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import SecondaryBtn from '@/components/secondaryBtn';
import { TriangleAlert } from "lucide-react";
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

    const formatMoney = (value) =>
        Number(roundToTwo(value)).toLocaleString('en', { minimumFractionDigits: 2 })

    var errorBox = null
    if (errorMessage) {
        errorBox = (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                <TriangleAlert className="h-5 w-5" strokeWidth={2.5} />
                <span className="text-sm font-semibold">{errorMessage}</span>
            </div>
        )
    }

    let content = (
        <>
            <ModalHeader className="border-b border-slate-200 px-6 py-4">
                <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Withdrawal Request
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {request.member_id.fullname}
                            <span className="text-sm font-medium text-slate-500"> ({request.member_id.username})</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                            {moment(request.transdate).format("MMM DD, YYYY hh:mm A")}
                        </p>
                    </div>
                  
                </div>
            </ModalHeader>
            <ModalBody className="px-6 py-5">
                <div className="flex flex-col gap-4">
                    {errorBox}
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Payout Method</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{request.paymethod.name}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Account Name</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{request.accountname}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Account / Mobile</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{request.accountno}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Contact</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{request.contactno || "--"}</p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Amount</p>
                            <p className="mt-1 text-base font-semibold text-slate-900">{formatMoney(request.amount)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Tax</p>
                            <p className="mt-1 text-base font-semibold text-slate-900">{formatMoney(request.tax)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Admin Fee</p>
                            <p className="mt-1 text-base font-semibold text-slate-900">{formatMoney(request.adminfee)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-3 text-white shadow-[0_16px_32px_rgba(15,23,42,0.2)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Net</p>
                            <p className="mt-1 text-base font-semibold">{formatMoney(request.net)}</p>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter className="justify-between border-t border-slate-200 px-6 py-4">
                <CancelBtn onClick={handleClose}>Cancel</CancelBtn>
                <div className="flex gap-2">
                    <SecondaryBtn type="button" onClick={handleReject} isLoading={processState==="reject"}>
                        Reject
                    </SecondaryBtn>
                    <PrimaryBtn type="button" onClick={handleApprove} isLoading={processState==="approve"}>
                        Approve
                    </PrimaryBtn>
                </div>
            </ModalFooter>
        </>
    )
   

    return(
        <Modal show={showView} onClose={handleClose} size="3xl">
            {content}
            <Confirm showConfirm={showConfirm} setshowConfirm={setshowConfirm} onYes={handleYes} ptype={ptype}/>
        </Modal>
    )

}


export default View;