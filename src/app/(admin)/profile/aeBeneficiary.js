import { useState, useEffect } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import PrimaryBtn from '@/components/primaryBtn';
import Select from 'react-select'
import moment from 'moment';
import callApi from "@/utils/api-caller";
import { TriangleAlert } from "lucide-react";

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

const tmpForm = {
    fname: "",
    mname: "",
    lname: "",        
    birthdate: moment().format('YYYY-MM-DD'),
    contactno: "",    
    address1: "",    
    province: null,
    city: null,
    zipcode: "",
    relationship: ""
        
}


function AEBeneficiary(props) {

    const {showAdd, setshowAdd, onSaved, paramId, selectedBeneficiary} = props    
    const [errorMessage, setErrorMessage] = useState("")    
    const [formdata, setForm] = useState(tmpForm) 
    const [provinces, setProvinces] = useState([])
	const [cities, setCities] = useState([])
    const [filteredCities, setFilteredCities] = useState([])   
    const [saveState, setSaveState] = useState("")
    const [editMode, setEditMode] = useState(false)
    
    useEffect(()=>{
        
        if(showAdd){
            setSaveState("")
            setErrorMessage("")    
            setEditMode(false)       
            if (selectedBeneficiary){
                setEditMode(true)
                let newF = {
                    fname: selectedBeneficiary.beneficiary_fname,
                    mname: selectedBeneficiary.beneficiary_mname,
                    lname: selectedBeneficiary.beneficiary_lname,
                    birthdate: moment(selectedBeneficiary.beneficiary_birthdate).format('YYYY-MM-DD'),
                    contactno: selectedBeneficiary.beneficiary_contact_no,
                    address1: selectedBeneficiary.beneficiary_address1,
                    province: selectedBeneficiary.beneficiary_province,
                    city: selectedBeneficiary.beneficiary_city,
                    zipcode: selectedBeneficiary.beneficiary_zipcode,
                    relationship: selectedBeneficiary.beneficiary_relationship
                }
                setForm(newF)                           
            }else{
                setForm(tmpForm)
            }                        
            init(selectedBeneficiary)
        }

    },[showAdd, selectedBeneficiary])
   

    const init = async (b)=>{        

        // console.log(b)
    
        try{           
           
            const ret =  await callApi("/others", "GET")             
            if (ret.status==200){                                          
                setProvinces(ret.data.provinces)
                setCities(ret.data.cities)
                if (b){
                    filterCities(b.beneficiary_province, ret.data.cities)
                }                             
            }

        }catch(err){
            console.log(err)
            // setloadstate("")
        }
        
    }

    const filterCities=(selectedProv, cities)=>{
		var newCities = cities.filter((obj)=>{
			return obj.province==selectedProv.value
		})

		setFilteredCities(newCities);
	}

    const handleClose = () => {      
        setForm(tmpForm)            
        setshowAdd(false)
    }


     const handleChange = (e)=>{      
        setErrorMessage("")
        setForm({ ...formdata, [e.target.name]: e.target.value })
    }

    const handleChangeProv = (e)=>{       
        setErrorMessage("")
        setForm({ ...formdata, province: e, city: null })
        filterCities(e, cities)
    }

    const handleChangeCity = (e)=>{      
        setErrorMessage("")
        setForm({ ...formdata, city: e })
    }


    const handleConfirm= async ()=>{        
        
       
      
         if (!formdata.fname.trim()) {         
            setErrorMessage("Please enter your first name!")
        }else if (!formdata.mname.trim()) {            
            setErrorMessage("Please enter your middle name!")
        }else if (!formdata.lname.trim()) {            
            setErrorMessage("Please enter your last name!")
        }else if (!formdata.birthdate) {            
            setErrorMessage("Please enter your birthdate")              
        }else  if (!formdata.address1.trim()) {            
            setErrorMessage("Please enter address 1!")
        }else if (!formdata.province) {            
            setErrorMessage("Please choose province!")
        }else if (!formdata.city) {            
            setErrorMessage("Please choose city!")               
        }else if (!formdata.contactno.trim()) {            
            setErrorMessage("Please enter contact number!")            
        }else if (!formdata.zipcode.trim()) {            
            setErrorMessage("Please enter zip code!")    
        }else if (!formdata.relationship.trim()) {            
            setErrorMessage("Please enter relationship!")            
        }else{

            try{
                setSaveState("saving")
                let params = {...formdata, id: paramId}             
                let url = "/profile/beneficiary/add"
                if (editMode){
                    params = {...formdata, id: selectedBeneficiary?._id}             
                    url = "/profile/beneficiary/update"
                }     
                // console.log(params)           
                const ret =  await callApi(url, "POST", params)            
                if (ret.status==200){                                          
                    setSaveState("success")
                    onSaved()      
                }else{
                    setErrorMessage(ret.message) 
                    return
                }

            }catch(err){
                console.log(err)    
                setSaveState("failed")
                setErrorMessage(err.name)           
            }                      
            // setTimeout(() => {
            //     setSaveState("success")
            //     onSaved()        
            // }, 3000);
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
        <Modal show={showAdd}  onClose={handleClose}>            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Add Beneficiary</ModalHeader>
                {errorBox}
                <div className='space-y-3 mt-6 mb-4'>
                    
                        <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">First Name <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="First Name" id="fname" value={formdata.fname} type="text" name='fname' onChange={handleChange}/>
                            </div>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Middle Name <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Middle Name" id="mname" value={formdata.mname} type="text" name='mname' onChange={handleChange}/>       
                            </div>                                                      
                        </div>
                        <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Last Name <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Last Name" id="lname" value={formdata.lname} type="text" name='lname' onChange={handleChange}/>
                            </div>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Birthdate <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Birthdate" id="birthdate" value={formdata.birthdate} type="date" name='birthdate' onChange={handleChange}/>
                            </div>
                        </div>
                         <div className=''>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Address  <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Address 1" id="address1" value={formdata.address1} type="text" name='address1'  onChange={handleChange}/>
                            </div>
                        </div>
                        <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Province <span className='text-red-500 text-xs'>*</span> </label>
                                <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={provinces} value={formdata.province}   onChange={handleChangeProv} />                            
                            </div>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">City <span className='text-red-500 text-xs'>*</span> </label>
                                <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={filteredCities} value={formdata.city} onChange={handleChangeCity} />                            
                            </div>
                        </div>
                        <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Contact Number <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Contact Number" id="contactno" value={formdata.contactno} type="text" name='contactno' onChange={handleChange}/>
                            </div>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Zip Code <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Zip Code" id="zipcode" value={formdata.zipcode} type="text" name='zipcode' onChange={handleChange}/>
                            </div>
                        </div>
                        <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                            <div>
                                <label className="text-base font-medium block text-[#404758] mb-2">Relationship <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Relationship" id="relationship" value={formdata.relationship} type="text" name='relationship' onChange={handleChange}/>
                            </div>
                            
                        </div>
                    
                    
                </div>
                              
                <ModalFooter className='justify-end pb-4'>                    
                    {
                        saveState==="saving"?"":<CancelBtn onClick={handleClose}>
                            Cancel
                        </CancelBtn>
                    }
                    
                    <PrimaryBtn type="button" onClick={handleConfirm} isLoading={saveState==="saving"} >
                        Save
                    </PrimaryBtn>
                </ModalFooter>
            
            </ModalBody>         
      </Modal>
    )

}


export default AEBeneficiary;