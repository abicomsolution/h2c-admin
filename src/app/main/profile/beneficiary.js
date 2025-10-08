
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { interFont } from '../layout';
import PrimaryBtn from '@/components/primaryBtn';
import AEBeneficiary from './aeBeneficiary';
import {  Button } from "flowbite-react";
import moment from 'moment';
import ConfirmDelete from './confirmDelete';


export default function Beneficiary(props) {


    const { onSaved, paramId, beneficiaries } = props
    const [showAdd, setshowAdd] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
    const [showConfirm, setshowConfirm] = useState(false);

    const handleAdd = ()=>{
        setSelectedBeneficiary(null)
        setshowAdd(true);
    }

    const handleBeneficiarySaved = ()=>{
        onSaved ()
    }

    const handleEdit = (item)=>{
        setSelectedBeneficiary(item)
        setshowAdd(true)
    }

    const handledelete = (item)=>{
        setSelectedBeneficiary(item)
        setshowConfirm(true)
    }

    const handleOnDeleted = async ()=>{

        window.location.reload();            
        // try{           
            
        //     let params = { id: selectedBeneficiary._id  }
        //     const ret =  await callApi("/profile/beneficiary/delete", "POST", params)             
        //     if (ret.status==200){        
        //         window.location.reload();                                                  
        //     }

        // }catch(err){
        //     console.log(err)
        //     // setloadstate("")
        // }

        // window.location.reload();
    }

   
    return (
          <div className='bg-white rounded-xl p-8'>
            <div className="border-b border-dotted border-gray-300 pb-3 flex justify-between">
                <h3 className="font-semibold text-xl text-[#707a91]">Beneficiary</h3>      
                <PrimaryBtn type="button"  onClick={handleAdd}  isLoading={false} >Add Beneficiary</PrimaryBtn>                                         
            </div>   
            <div className="mt-6 space-y-4">
              {
                beneficiaries.map((item, index)=>(
                    <div key={index} className='flex-1 md:grid md:grid-cols-[1fr_100px] gap-4 border-b border-dotted border-gray-300'>
                        <div className='space-y-1 py-2 '>
                            <div className='flex gap-2'>
                                <label className="text-base font-medium block text-[#656b77] w-[110px]">Name: </label>
                                <label className="text-base  block text-[#16171b]">{item.beneficiary_fname} {item.beneficiary_mname} {item.beneficiary_lname}</label>
                            </div>
                            <div className='flex gap-2'>
                                <label className="text-base font-medium block text-[#656b77] w-[110px]">Address: </label>
                                <label className="text-base lock text-[#16171b]">{item.beneficiary_address1}, {item.beneficiary_city.label}, {item.beneficiary_province.label} {item.beneficiary_zipcode}</label>
                            </div>
                            <div className='flex gap-2'>
                                <label className="text-base font-medium block text-[#656b77] w-[110px]">Birthdate: </label>
                                <label className="text-base text-[#16171b]">{moment(item.beneficiary_birthdate).format('MMMM D, YYYY')}</label>
                            </div>
                            <div className='flex gap-2'>
                                <label className="text-base font-medium block text-[#656b77] w-[110px]">Contact No.: </label>
                                <label className="text-base block text-[#16171b]">{item.beneficiary_contact_no}</label>
                            </div>
                            <div className='flex gap-2'>
                                <label className="text-base font-medium block text-[#656b77] w-[110px] mb-4">Relationship: </label>
                                <label className="text-base block text-[#16171b]">{item.beneficiary_relationship}</label>
                            </div>
                        </div>
                        <div className='flex md:justify-end gap-2 mb-4'>
                            <Button pill size="sm" onClick={()=>handleEdit(item)} className="px-4 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white hover:bg-gradient-to-br focus:ring-red-300 dark:focus:ring-red-800">Edit</Button>   
                            <Button pill size="sm" onClick={()=>handledelete(item)} className="px-4 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:bg-gradient-to-br focus:ring-red-300 dark:focus:ring-red-800">Delete</Button>   
                        </div>
                    </div>
                ))                    
              }

            </div>
            <AEBeneficiary showAdd={showAdd} setshowAdd={setshowAdd}  onSaved={handleBeneficiarySaved} paramId={paramId} selectedBeneficiary={selectedBeneficiary}/>        
            <ConfirmDelete showConfirm={showConfirm} setshowConfirm={setshowConfirm} onYes={handleOnDeleted} selectedBeneficiary={selectedBeneficiary} />
          </div>
    )

}