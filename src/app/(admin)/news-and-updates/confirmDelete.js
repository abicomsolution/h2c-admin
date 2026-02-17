"use client";
import React, { useEffect, useState} from 'react';
import Modal from 'react-responsive-modal'
import PrimaryBtn from '@/components/primaryBtn';
import CancelBtn from '@/components/cancelBtn';
import { TriangleAlert } from "lucide-react";
import callApi from '@/utils/api-caller';
import _ from 'lodash';

const modalStyle = {
    modal: {
        padding: 0,
        background:'transparent',
        width: '400px',
    },
    overlay: {
        alignItems: 'center'
    }
}


export default function ConfirmDelete(props) {
    
    const { open, onCloseModal, data, onDeleteSuccess } = props; 
    const [errorMessage, setErrorMessage] = useState("")
    const [deleteState, setdeleteState] = useState("")    

    const handleDelete = async(e)=>{    
       
        try {
            
            setdeleteState("saving")
            setErrorMessage("")
           
            const response = await callApi('/highlights/delete', 'POST', { _id: data._id });
            if (response.status==200){       
                setdeleteState("")
                onDeleteSuccess()
            }else{
                setdeleteState("failed")
                setErrorMessage(response.message)
            }
            
        } catch (error) {
            console.error('Error saving setup:', error);
            setErrorMessage("An error occurred while saving. Please try again.")
            setdeleteState("")
            return;
        }              
    }

   

    var errorBox = null
    if (errorMessage) {
        errorBox =  <div className="px-6">
                        <div className="flex gap-2 bg-[#e12d2dbf] p-2 rounded-sm">
                            <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                            <span className="text-base font-bold text-white">{errorMessage}</span>
                        </div>
                    </div>
                   
    }


    return (
        <Modal open={open}  showCloseIcon={false}   
                    styles={modalStyle} 
                    closeOnOverlayClick={false}
                    onClose={onCloseModal} center>
            
            <div className="bg-white">
                <div className="border-b px-8 py-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Delete Highlight
                    </h3>
                </div>
                {errorBox}
                <div className="px-6 pt-6 pb-10">
                    <h1 className="text-base font-normal text-gray-700">Are you sure you want to delete the selected highlight? This action cannot be undone.</h1>
                    <div className="flex justify-end gap-4 mt-6">
                        <CancelBtn onClick={onCloseModal} isLoading={deleteState==="saving"}>No</CancelBtn>
                        <PrimaryBtn type="button" onClick={handleDelete}  isLoading={deleteState==="saving"}>Yes, I am sure</PrimaryBtn>
                    </div>
                </div>
            </div>
           
        </Modal>
    );
}   