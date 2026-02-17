import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';

function Confirm(props) {

    const {showConfirm, setshowConfirm, onYes} = props        
   

    const handleClose = () => {        
        setshowConfirm(false)
    }


    const handleConfirm= async ()=>{               
        onYes()
    }


    return(
        <Modal show={showConfirm}  onClose={handleClose} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Save</ModalHeader>
             
                
                <p className='text-xl font-medium mt-4 px-5'>Are you sure you want to save your changes?</p>
                <p className='text-sm text-gray-500 mb-4 px-5 mt-2'>Please be advise that once you save, any succeeding changes shall be upon request and approval of admin.</p>

                <ModalFooter className='justify-end'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleConfirm} >
                        Yes
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default Confirm;