import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label, Radio  } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { interFont } from '../layout';
import { TriangleAlert } from "lucide-react";
import callApi from '@/utils/api-caller';

function ConfirmUpgrade(props) {

    const {showConfirm, setshowConfirm, onYes, selectedMember} = props      
    const [upgradeState, setupgradeState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")    

    useEffect(()=>{
        if (showConfirm){                  
            setErrorMessage("")
            setupgradeState("")
        }
    },[showConfirm])

    const handleClose = () => {        
        setshowConfirm(false)
    }

   
    const handleConfirm= async ()=>{               
        try{
            // setupgradeState("upgrade")
            // setTimeout(() => {
            //     setupgradeState("success")
            //     onYes()
            // }, 5000);
            // console.log("selectedMember", selectedMember)
            setupgradeState("upgrade")
            const ret =  await callApi("/member/upgrade", "POST", {id: selectedMember._id}) 
            if (ret.status==200){                
                setupgradeState("success")
                onYes()
            }else{         
                setupgradeState("")     
                setErrorMessage(ret.message || "Error occurred. Please try again.")
            }                        
        }catch(err){
            setupgradeState("")     
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
                <ModalHeader className='border-b-gray-200 pl-0'>Upgrade</ModalHeader>
                {errorBox}

                <p className='text-xl font-medium mt-4 px-5'>Are you sure you want to upgrade this member from CD to Paid?</p>                
                

                
                <ModalFooter className='justify-end mt-6'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={upgradeState==="upgrade"} disabled={upgradeState==="upgrade"} >
                        Yes
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default ConfirmUpgrade