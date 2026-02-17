import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label, Radio  } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import callApi from '@/utils/api-caller';
import { pad } from '@/utils/functions';

function ConfirmDelete(props) {

    const {showConfirm, setshowConfirm, onYes, selectedOrder} = props      
    const [deleteState, setdeleteState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")    

    useEffect(()=>{
        if (showConfirm){                  
            setErrorMessage("")
            setdeleteState("")
        }
    },[showConfirm])

    const handleClose = () => {        
        setshowConfirm(false)
    }

   
    const handleConfirm= async ()=>{               
        try{
            // setdeleteState("delete")
            // setTimeout(() => {
            //     setdeleteState("success")
            //     onYes()
            // }, 5000);
            // console.log("selectedMember", selectedMember)
            setdeleteState("delete")
            const ret =  await callApi("/order/delete/"+selectedOrder._id,  "GET") 
            if (ret.status==200){                
                setdeleteState("success")
                onYes()
            }else{         
                setdeleteState("")     
                setErrorMessage(ret.message || "Error occurred. Please try again.")
            }                        
        }catch(err){
            setdeleteState("")     
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
        <Modal show={showConfirm}  onClose={handleClose} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Delete</ModalHeader>
                {errorBox}


                <p className='text-xl mt-4 px-5'>Are you sure you want to delete this order?</p>                
                <p className='text-lg font-semibold mt-4 px-5'>{pad(selectedOrder?.order_num, 6)}</p>                
                
                <ModalFooter className='justify-end mt-6'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={deleteState==="delete"} disabled={deleteState==="delete"} >
                        Yes
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default ConfirmDelete