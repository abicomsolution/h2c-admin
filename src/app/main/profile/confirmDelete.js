import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { interFont } from '../layout';
import callApi from "@/utils/api-caller";

function ConfirmDelete(props) {

    const {showConfirm, setshowConfirm, onYes, selectedBeneficiary} = props        
    const [deleteState, setDeleteState] = useState("")

    const handleClose = () => {        
        setshowConfirm(false)
    }


    const handleConfirm= async ()=>{       
        
        try{           
           
            setDeleteState("delete")         
            let params = { id: selectedBeneficiary._id  }   
            const ret =  await callApi("/profile/beneficiary/delete", "POST", params)             
            if (ret.status==200){     
                setDeleteState("deleted")   
                onYes()                                       
            }

            // setTimeout(() => {
            //     setDeleteState("")
            //     window.location.reload();        
            // }, 3000);
          
        }catch(err){
            console.log(err)
            // setloadstate("")
        }

        
       
    }


    return(
        <Modal show={showConfirm}  onClose={handleClose} className={`${interFont.className}`} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Delete</ModalHeader>

                <p className='text-xl font-medium mt-4 px-5'>Are you sure you want to delete this beneficiary?</p>                

                <ModalFooter className='justify-end mt-6'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={deleteState=="delete"}>
                        Yes
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default ConfirmDelete;