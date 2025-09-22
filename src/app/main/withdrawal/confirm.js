
import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import {  Info, LucideTrash2} from "lucide-react"
import callApi from '@/utils/api-caller';



function Confirm(props) {

    const { showConfirm, setshowConfirm, onYes, ptype, interFont} = props        
    const [deletestate, setdeletestate] = useState("")
  
    const handleClose = () => {        
        setshowConfirm(false)
   }
   
    const handleSubmit = async ()=>{             
        onYes()         
    }




    return(
        <Modal show={showConfirm}  onClose={handleClose} size='sm' className={`${interFont.className}`} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Confirm</ModalHeader>
                <div className='flex justify-center items-center mt-6'>                
                    <Info color="#428f18" className='h-18 w-18' />                        
                </div>     

                <p className='text-center mt-4 text-xl font-semibold'>Are you sure you want to {ptype==1?"approve":"reject"} this request?</p>

                <ModalFooter className='justify-end mt-6'>                    
                    <CancelBtn onClick={handleClose}>
                        No
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleSubmit} isLoading={deletestate==="delete"}>
                        Yes
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>              
      </Modal>
    )

}


export default Confirm;