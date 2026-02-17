import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label, Radio  } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { TriangleAlert } from "lucide-react";
import callApi from '@/utils/api-caller';
import { pad } from '@/utils/functions';

function ConfirmPost(props) {

    const {showPostConfirm, setShowPostConfirm, onYes, orderData} = props      
    const [postState, setPostState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")    

    useEffect(()=>{
        if (showPostConfirm){                  
            setErrorMessage("")
            setPostState("")
        }
    },[showPostConfirm])

    const handleClose = () => {        
        setShowPostConfirm(false)
    }

   
    const handleConfirm= async ()=>{               
        try{
            // setPostState("post")
            // setTimeout(() => {
            //     setPostState("success")
            //     onYes()
            // }, 5000);
            // console.log("selectedMember", selectedMember)
            setPostState("post")
            const ret =  await callApi("/order/post/", "POST", { _id: orderData._id }) 
            if (ret.status==200){                
                setPostState("success")
                onYes()
            }else{         
                setPostState("")     
                setErrorMessage(ret.message || "Error occurred. Please try again.")
            }                        
        }catch(err){
            setPostState("")     
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
        <Modal show={showPostConfirm}  onClose={handleClose} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Post</ModalHeader>
                {errorBox}


                <p className='text-xl mt-4 px-5'>Are you sure you want to post this order?</p>                
                <p className='text-lg font-semibold mt-4 px-5'>{pad(orderData?.order_num, 6)}</p>                
                
                <ModalFooter className='justify-end mt-6'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={postState==="post"} disabled={postState==="post"} >
                        Yes
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default ConfirmPost