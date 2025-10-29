import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { interFont } from '../../layout';
import { TriangleAlert } from "lucide-react";
import {  CircleCheck, LucideTrash2} from "lucide-react"
import callApi from '@/utils/api-caller';



function Delete(props) {

    const { showDelete, setshowDelete, onCloseSuccess, data} = props        
    const [deletestate, setdeletestate] = useState("")
  
     const handleClose = () => {        
        setshowDelete(false)
    }
   
    const handleSubmit = async ()=>{
             

        try{
          
            setdeletestate("delete")            
            let params = { id: data._id }            
            const ret =  await callApi("/setting/category/delete",'POST', params) 
            if (ret.status==200){    
                setdeletestate("success")
                 onCloseSuccess()           
            }else{
                console.log(ret.message)
            }
            // setTimeout(() => {
            //     onCloseSuccess()
            //     setdeletestate("success")
            // }, 2000);
          
        }catch(err){
            console.log(err)           
        }
    }




    return(
        <Modal show={showDelete}  onClose={handleClose} className={`${interFont.className}`} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Delete</ModalHeader>
                <div className='flex justify-center items-center mt-6'>                
                    <LucideTrash2 color="#ff3232" className='h-18 w-18' />                        
                </div>     

                <p className='text-center mt-4 text-xl font-semibold'>Are you sure you want to delete <span className='font-bold'>{data?.name}</span> ?</p>

                <ModalFooter className='justify-end mt-6'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleSubmit} isLoading={deletestate==="delete"}>
                        Continue
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>              
      </Modal>
    )

}


export default Delete;