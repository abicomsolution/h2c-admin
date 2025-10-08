import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label, Radio  } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { interFont } from '../layout';
import { TriangleAlert } from "lucide-react";
import callApi from '@/utils/api-caller';

function ConfirmHub(props) {

    const {showConfirm, setshowConfirm, onYes, selectedMember} = props     
    const [hubtype, sethubtype] = useState(0)   
    const [promoteState, setPromoteState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")    

    useEffect(()=>{
        if (showConfirm){         
            sethubtype(0) 
            setErrorMessage("")
            setPromoteState("")
        }
    },[showConfirm])

    const handleClose = () => {        
        setshowConfirm(false)
    }

    const handChangeType = (i)=>{
        setErrorMessage("")
        sethubtype(i)
    }

    const handleConfirm= async ()=>{               
        try{
            // console.log("selectedMember", selectedMember)
            setPromoteState("promoting")
            const ret =  await callApi("/profile/promote", "POST", {id: selectedMember._id, hubtype: hubtype}) 
            if (ret.status==200){                
                setPromoteState("success")
                onYes()
            }else{              
                setErrorMessage(ret.message || "Error occurred. Please try again.")
            }                        
        }catch(err){
            setErrorMessage("Error occurred. Please try again.")
        }        
    }

    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                    
    }



    return(
        <Modal show={showConfirm}  onClose={handleClose} className={`${interFont.className}`} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Promote To Hub</ModalHeader>
                {errorBox}

                <p className='text-xl font-medium mt-4 px-5'>Are you sure you want to promote this member to Hub?</p>
                <p className='text-sm text-gray-500 mb-4 px-5 mt-6'>Choose type of Hub below:</p>
                <div className='flex gap-6 ml-5 mb-4'>
                    <div className="flex items-center gap-2">
                        <Radio id="ewallet" name="tpe" value={0} checked={hubtype===0} onChange={()=>handChangeType(0)}/>
                        <Label htmlFor="ewallet" className='md:text-lg font-medium'>Municipal Hub </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Radio id="bank" name="tpe" value={1} checked={hubtype===1} onChange={()=>handChangeType(1)}/>
                        <Label htmlFor="bank" className='md:text-lg font-medium'>City Hub</Label>
                    </div>                   
                </div>

                
                <ModalFooter className='justify-end'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={promoteState==="promoting"} disabled={promoteState==="promoting"} >
                        Promote
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default ConfirmHub;