import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label, Radio  } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { interFont } from '../layout';
import { TriangleAlert } from "lucide-react";
import callApi from '@/utils/api-caller';
import { pad } from '@/utils/functions';

function ConfirmDelete(props) {

    const {showConfirm, setshowConfirm, onYes, selectedMonth, selectedYear} = props      
    const [processState, setprocessState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")    

    useEffect(()=>{
        if (showConfirm){                  
            setErrorMessage("")
            setprocessState("")
        }
    },[showConfirm])

    const handleClose = () => {        
        setshowConfirm(false)
    }

   
    const handleConfirm= async ()=>{               
        try{
            setprocessState("process")
            // setTimeout(() => {
            //     setprocessState("success")
            //     onYes()
            // }, 5000);            
            let params ={
                month: selectedMonth.value,
                year: selectedYear.value
            }     
            const ret =  await callApi("/unilevel/process",  "POST", params) 
            if (ret.status==200){                
                setprocessState("success")
                onYes()
            }else{         
                setprocessState("")     
                setErrorMessage(ret.message || "Error occurred. Please try again.")
            }                        
        }catch(err){
            setprocessState("")     
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
               
                <h1 className='py-4 text-xl font-bold'>Process Unilevel</h1>
                {errorBox}


                <p className='text-xl mt-6 px-5'>This will lock the unilevel for {selectedMonth.label} {selectedYear.label}, Are you sure you want to continue?</p>                
                      
                
                <ModalFooter className='justify-end mt-6'>                    
                    {
                        processState!=="process" &&  <CancelBtn onClick={handleClose}>
                            Cancel
                        </CancelBtn>
                    }
                    
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={processState==="process"} disabled={processState==="process"} >
                        Yes
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default ConfirmDelete