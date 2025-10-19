import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label, Radio  } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import { interFont } from '../layout';
import { TriangleAlert } from "lucide-react";
import callApi from '@/utils/api-caller';
import Select from 'react-select'


const controlStyle = {    
    menuPortal: provided => ({ ...provided, zIndex: 9999 }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
    control: (baseStyles, state) => ({
        ...baseStyles,      
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "4px",
        paddingBottom: "4px",
        borderRadius: "20px"
    }),
   
}

function ConfirmHub(props) {

    const {showConfirm, setshowConfirm, onYes, selectedMember} = props     
    const [hubtype, sethubtype] = useState(0)   
    const [promoteState, setPromoteState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")        
    const [loadstate, setloadstate] = useState("")
    const [provinces, setProvinces] = useState([])
	const [cities, setCities] = useState([])
    const [selectedProvince, setSelectedProvince] = useState(null)
    const [selectedCity, setSelectedCity] = useState(null)
    const [filteredCities, setFilteredCities] = useState([])   

    useEffect(()=>{
        if (showConfirm){      
            fetchList(0)   
            sethubtype(0) 
            setErrorMessage("")
            setPromoteState("")
        }
    },[showConfirm])

    const handleClose = () => {        
        setshowConfirm(false)
    }

    const handChangeType = (i)=>{
        setErrorMessage("")
        setSelectedProvince(null)
        setSelectedCity(null)
        sethubtype(i)
        fetchList(i)
    }

    const fetchList = async (index)=>{
        setloadstate("loading")     
        try{                 
            const ret =  await callApi("/member/getarea", "POST", {type: index}) 
            if (ret.status==200){                
                setProvinces(ret.data.provinces)
                setCities(ret.data.cities)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }

    // console.log(provinces)
    // console.log(cities)

    const handleConfirm= async ()=>{               
        try{

            if (!selectedProvince){
                setErrorMessage("Please select province.")
                return
            }else if (hubtype!==2 && !selectedCity){
                setErrorMessage(hubtype===1 ? "Please select city." : "Please select municipality.")
                return
            }


            // console.log("selectedMember", selectedMember)
            setPromoteState("promoting")
            let params = {
                id: selectedMember._id, 
                hubtype: hubtype,
                province: selectedProvince._id,
                citym: selectedCity?selectedCity._id:null 
            }
            const ret =  await callApi("/profile/promote", "POST", params) 
            if (ret.status==200){                
                setPromoteState("success")
                onYes()
            }else{              
                setErrorMessage(ret.message || "Error occurred. Please try again.")
                setPromoteState("failed")
            }                        
        }catch(err){
            setErrorMessage("Error occurred. Please try again.")
            setPromoteState("failed")
        }        
    }

    const filterCities=(selectedProv, cities)=>{
		var newCities = cities.filter((obj)=>{
			return obj.province==selectedProv.value
		})

		setFilteredCities(newCities);
	}


    const handleChangeProv = (e)=>{       
        setErrorMessage("")
        setSelectedProvince(e)
        setSelectedCity(null)
        filterCities(e, cities)
    }

    const handleChangeCity = (e)=>{      
        setErrorMessage("")
        setSelectedCity(e)
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
                <ModalHeader className='border-b-gray-200 pl-0'>Promote To Hub</ModalHeader>
                {errorBox}

                <p className='text-xl font-medium mt-4 px-5'>Are you sure you want to promote this member to Hub?</p>
                <p className='text-sm text-gray-500 mb-4 px-5 mt-6'>Choose type of Hub below:</p>
                <div className='flex gap-6 ml-5 mb-4'>
                    <div className="flex items-center gap-2">
                        <Radio id="ewallet" name="tpe" value={0} checked={hubtype===0} onChange={()=>handChangeType(0)}/>
                        <Label htmlFor="ewallet" className='md:text-lg font-medium'>Municipal Hub </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Radio id="city" name="tpe" value={1} checked={hubtype===1} onChange={()=>handChangeType(1)}/>
                        <Label htmlFor="city" className='md:text-lg font-medium'>City Hub</Label>
                    </div>        
                    <div className="flex items-center gap-2">
                        <Radio id="province" name="tpe" value={2} checked={hubtype===2} onChange={()=>handChangeType(2)}/>
                        <Label htmlFor="province" className='md:text-lg font-medium'>Provincial Hub</Label>
                    </div>               
                </div>

               
                <div className='mt-4'>
                    <p className='text-sm text-gray-500 mb-4 px-5 mt-6'>Choose coverage area:</p>
                    <div className='space-y-2 md:grid grid-cols-2 gap-4 ml-5'>
                        <div>
                            <label className="text-base font-medium block text-[#404758] mb-2">{hubtype===2 ? "Choose Province" : "Search By Province"} <span className='text-red-500 text-xs'>*</span> </label>
                            <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={provinces} value={selectedProvince}   onChange={handleChangeProv} />                            
                        </div>
                        {
                           hubtype!==2 && <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Choose {hubtype===1 ? "City" : "Municipality"} <span className='text-red-500 text-xs'>*</span> </label>
                                <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={filteredCities} value={selectedCity} onChange={handleChangeCity} />                            
                            </div>
                        }
                        
                    </div>
                </div>

                
                <ModalFooter className='justify-end mt-6'>                    
                    <CancelBtn onClick={handleClose}>
                        Cancel
                    </CancelBtn>
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={promoteState==="promoting"} disabled={promoteState==="promoting"} >
                        Promote
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default ConfirmHub;