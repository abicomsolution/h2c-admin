import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label, Radio  } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { interFont } from '../../layout';
import { TriangleAlert } from "lucide-react";
import {  CircleCheck} from "lucide-react"
import callApi from '@/utils/api-caller';
import _ from 'lodash'
import { tmpForm } from './page';

function AEForm(props) {

    const { showAe, setshowAe, onCloseSuccess, bEdit, data} = props
    const [savestate, setsavestate] = useState("")
    const [formdata, setForm] = useState(tmpForm)
    const [errorMessage, setErrorMessage] = useState("")    

    useEffect(()=>{

        if (showAe){         
            if (bEdit && data._id) {                
                setForm(data) 
            }else{
                setForm(tmpForm) 
            }
            
            setErrorMessage("")
            setsavestate("")
        }

    },[showAe])

     const handleClose = () => {        
        setshowAe(false)
    }


    const handleChange = (e)=>{
        setErrorMessage("")
        setForm({...formdata,
            [e.target.name]: e.target.value
        })
    }

    const handleChangeStat=()=>{
        setErrorMessage("")
        setForm({...formdata, status: formdata.status==0?1:0})
    }

    const handleChangeTpe = (i)=>{
        setErrorMessage("")
        setForm({...formdata, tpe: i})
    }

    const handleSubmit = async ()=>{
       
        if (!formdata.name.trim()){
            setErrorMessage("Please enter name.")
            return
        }

        try{
            setsavestate("saving")
            let url = "/setting/pm/add"
            if (bEdit){
                url = "/setting/pm/update"
            }
            const ret =  await callApi(url,'POST', formdata) 
            if (ret.status==200){         
                 onCloseSuccess() 
                setsavestate("success")                     
            }else{
                setErrorMessage(ret.message)    
                setsavestate("failed")
            }

            // setTimeout(() => {
            //     setsavestate("success")
            //     onCloseSuccess()
            // }, 2000);

        }catch(err){
            console.log(err)
            setErrorMessage(err.name)
            
        }
    }

 

    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                    
    }

    let content =  <ModalBody>              
                        <ModalHeader className='border-b-gray-200 pl-0'>Add Payout Method</ModalHeader>
                        {errorBox}
                        <div className='mt-6'>
                            <label htmlFor="username" className="md:text-lg font-medium block mb-4">Name</label>
                            <input
                                className="text-sm border w-full border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="name" name="name" value={formdata.name} onChange={handleChange} type="text" maxLength={150}></input>
                        </div>     

                        <div className='mt-0'>
                            <label className="md:text-lg font-medium block mb-4">Type</label>
                            <div className='flex gap-6'>
                                <div className="flex items-center gap-2">
                                    <Radio id="ewallet" name="tpe" value={0} checked={formdata.tpe===0} onChange={()=>handleChangeTpe(0)}/>
                                    <Label htmlFor="ewallet" className='md:text-lg font-medium'>E-Wallet</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Radio id="bank" name="tpe" value={0} checked={formdata.tpe===1} onChange={()=>handleChangeTpe(1)}/>
                                    <Label htmlFor="bank" className='md:text-lg font-medium'>Bank</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Radio id="remittance" name="tpe" value={0} checked={formdata.tpe===2} onChange={()=>handleChangeTpe(2)}/>
                                    <Label htmlFor="remittance" className='md:text-lg font-medium'>Remittance</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Radio id="cheque" name="tpe" value={0} checked={formdata.tpe===3} onChange={()=>handleChangeTpe(3)}/>
                                    <Label htmlFor="cheque" className='md:text-lg font-medium'>Cheque</Label>
                                </div>
                            </div>
                        </div>     


                        <div className="flex  gap-3 mb-4 mt-5">
                            <div className="mt-4">
                                <Checkbox id="status" checked={formdata.status===1} onChange={handleChangeStat} />
                            </div> 
                            <Label htmlFor="status" className="md:text-lg font-medium mt-3">
                                Inactive
                            </Label>
                        </div>

                        <ModalFooter className='justify-end'>                    
                            <CancelBtn onClick={handleClose}>
                                Cancel
                            </CancelBtn>
                            <PrimaryBtn type="button" isLoading={savestate==="saving"} onClick={handleSubmit}>
                                Save
                            </PrimaryBtn>
                        </ModalFooter>
                    
                    </ModalBody>     
    
    return(
        <Modal show={showAe}  onClose={handleClose} className={`${interFont.className}`} >            
            {content}           
      </Modal>
    )

}


export default AEForm;