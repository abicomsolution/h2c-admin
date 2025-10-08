"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { interFont } from '../layout';
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";
import { TUSER } from '@/utils/constants';
import PreLoader from '@/components/preloader';
import UserPic from '../../../assets/no_photo.png'
import PrimaryBtn from '@/components/primaryBtn';
import { Datepicker } from "flowbite-react";
import { TriangleAlert, ArrowLeft } from "lucide-react";
import { validateEmail } from '@/utils/functions';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select'
import Confirm from './confirm';
import Beneficiary from './beneficiary';


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
    email: "",
    contactno: "",
    referralcode: "",  
    birthdate: new Date(),
    photo: "",
    username: ""

}

const tmpForm2 = {
    address1: "",
    address2: "",
    province: null,
    city: null,
    zipcode: ""    
}

const tmpForm3 = {
    paymethod: null,    
    accountno: "",
    accountname: "",
    pmcontactno: ""    
}

const tmpForm4 = {
    password: "",    
    confirmpass: "",    
}

export default function Profile() {

    const session = useSession()
    const router = useRouter();    
    // const [profile, setprofile] = useState(tmpForm);
    const [loadstate, setloadstate] = useState("")
    const [initialized, setinitialized] = useState(false) 
    const [errorMessage, setErrorMessage] = useState("")    
    const [userdata, setuserdata] = useState(TUSER)
    const [formdata, setForm] = useState(tmpForm)
    const [saveState, setSaveState] = useState("")
    const [photo, setphoto] = useState(null)
    const [formdata2, setForm2] = useState(tmpForm2)
    const [provinces, setProvinces] = useState([])
	const [cities, setCities] = useState([])
    const [filteredCities, setFilteredCities] = useState([])
    const [saveState2, setSaveState2] = useState("")
    const [pm, setpm] = useState([])
    const [formdata3, setForm3] = useState(tmpForm3)
    const [saveState3, setSaveState3] = useState("")
    const [formdata4, setForm4] = useState(tmpForm4)
    const [saveState4, setSaveState4] = useState("")
    const [pwdShown, showPassword] = useState(false)
    const [confirmPwdShown, showConfirmPassword] = useState(false)
    const [showConfirm, setshowConfirm] = useState(false)
    const [card, setcard] = useState(0)
    const [beneficiaries, setBeneficiaries] = useState([])
    const [paramId, setparamId] = useState("")
  

    useEffect(() => {
    
        if (session.status === "unauthenticated") {
            router.replace("/login");
        }else if (session.status=="authenticated"){                 
            setinitialized(true)                
        }
    
    }, [session])


    useEffect(() => {
        
        if (initialized){   
            const searchParams = new URLSearchParams(window.location.search);
            const id = searchParams.get("id");
            setparamId(id)
            init(id)   
        }
        
    }, [initialized])

    const filterCities=(selectedProv, cities)=>{
		var newCities = cities.filter((obj)=>{
			return obj.province==selectedProv.value
		})

		setFilteredCities(newCities);
	}

    const init = async (id)=>{
      
        setloadstate("loading")     
        try{           
            // setTimeout(() => {
            //     setloadstate("success")
            // }, 2000);      
            let params = { id: id}
            console.log(params)
            const ret =  await callApi("/profile", "POST", params) 
          
            if (ret.status==200){                                
                let newForm = {
                    fname: ret.data.profile.fname,
                    mname: ret.data.profile.mname,
                    lname: ret.data.profile.lname,
                    email: ret.data.profile.emailadd,
                    contactno: ret.data.profile.mobile1,                    
                    birthdate: ret.data.profile.birthdate?moment(ret.data.profile.birthdate).toDate():new Date(),
                    photo: ret.data.profile.photo_thumb,
                    username: ret.data.profile.username,                    
                }
                setForm(newForm)                
                setBeneficiaries(ret.data.beneficiaries)
                setProvinces(ret.data.provinces)
                setCities(ret.data.cities)
                if (ret.data.profile.province){
                    filterCities(ret.data.profile.province, ret.data.cities)
                }
                

                let newForm2 = {
                    address1: ret.data.profile.address1,
                    address2: ret.data.profile.address2,
                    province: ret.data.profile.province,
                    city: ret.data.profile.city,
                    zipcode: ret.data.profile.zipcode                    
                }
                setForm2(newForm2)

                let newForm3 = {
                    paymethod: ret.data.profile.paymethod,    
                    accountno: ret.data.profile.accountno,   
                    accountname: ret.data.profile.accountname                    
                }
                setForm3(newForm3)
                setForm4(tmpForm4)
                setpm(ret.data.pm)
                
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }


    const handleSave = async ()=>{
        setcard(0)
        setshowConfirm(true)

    }

    const savePI = async ()=>{       
        var checkEmail = validateEmail(formdata.email)        
        if (!formdata.fname.trim()) {
            setSaveState("failed")  
            setErrorMessage("Please enter your first name!")
        }else if (!formdata.mname.trim()) {
            setSaveState("failed")  
            setErrorMessage("Please enter your middle name!")
        }else if (!formdata.lname.trim()) {
            setSaveState("failed")  
            setErrorMessage("Please enter your last name!")
        }else if (!formdata.birthdate) {
            setSaveState("failed")  
            setErrorMessage("Please enter your birthdate")
        }else if (!formdata.email.trim()) {
            setSaveState("failed")  
            setErrorMessage("Please enter your email!")
        } else if (!checkEmail) {
            setSaveState("failed")  
            setErrorMessage('Invalid email address.')
        }else if (!formdata.contactno.trim()) {
            setSaveState("failed")  
            setErrorMessage("Please enter contact number!")        
        }else{

            try{  
                setSaveState("saving")  
                let params = {...formdata, 
                    id: paramId,
                    photo: photo 
                }
                const ret =  await callApi("/profile/update", "POST", params) 
                if (ret.status==200){                                
                    setSaveState("success")      
                    toast.success('Changes successfully saved!')
                    init(paramId)
                }else{
                    setSaveState("failed")
                    setErrorMessage(ret.message)
                }                
                
            }catch(err){
                setSaveState("failed")
                console.log(err)                
            }
        }

    }


    const handleSave2 = async ()=>{
       setcard(1)
       setshowConfirm(true)
        
    }


     const savePA = async ()=>{      
        if (!formdata2.address1.trim()) {
            setSaveState2("failed")  
            setErrorMessage("Please enter address 1!")
        }else if (!formdata2.province) {
            setSaveState2("failed")  
            setErrorMessage("Please choose province!")
        }else if (!formdata2.city) {
            setSaveState2("failed")  
            setErrorMessage("Please choose city!")       
        }else if (!formdata2.zipcode.trim()) {
            setSaveState2("failed")  
            setErrorMessage("Please enter zip code!")        
        }else{

            try{  
                // setSaveState("saving")  
                let params = {...formdata2, 
                    id: paramId                   
                }
                console.log(params)
                const ret =  await callApi("/profile/address", "POST", params) 
                if (ret.status==200){                                
                    setSaveState2("success")      
                    toast.success('Changes successfully saved!')
                    init(paramId)
                }else{
                    setSaveState2("failed")
                    setErrorMessage(ret.message)
                }
                // console.log(formd)
                // setSaveState2("saving")      
                // setTimeout(() => {
                //     setSaveState2("success")      
                //     toast.success('Changes successfully saved!')
                // }, 5000);   

            }catch(err){
                setSaveState2("failed")
                console.log(err)                
            }
        }
    }

  
    const handleSave4 = async ()=>{
        setcard(3)
        if (!formdata4.password.trim()) {
            setSaveState4("failed")  
            setErrorMessage("Please enter password.")
        }else if (formdata4.password.length < 6) {
            setSaveState4("failed")  
            setErrorMessage("Password is too short (at least 6 alpha-numeric characters)")
        }else if (formdata4.password.trim() != formdata4.confirmpass.trim()) {
            setSaveState4("failed")  
            setErrorMessage("Password does not match.");           
        }else{

            try{  
                setSaveState4("saving")  
                let params = {...formdata4, 
                    id: paramId                   
                }
                console.log(params)
                const ret =  await callApi("/profile/password", "POST", params) 
                if (ret.status==200){                                
                    setSaveState4("success")      
                    toast.success('Pasword successfully changed!')
                    init(paramId)
                }else{
                    setSaveState4("failed")
                    setErrorMessage(ret.message)
                }
                // // console.log(formd)
                // setSaveState4("saving")      
                // setTimeout(() => {
                //     setSaveState4("success")      
                //     toast.success('Pasword successfully changed!')
                // }, 3000);   

            }catch(err){
                setSaveState2("failed")
                console.log(err)                
            }
        }
    }

    const handleSave3 = async ()=>{
        setcard(2)
        setshowConfirm(true)
    }
    
    const savePayout = async ()=>{
        setcard(2)
        if (!formdata3.paymethod) {
            setSaveState3("failed")  
            setErrorMessage("Please choose payout method!")        
        }else if (!formdata3.accountname){
            setSaveState3("failed")  
            setErrorMessage("Please enter account name!")                
        }else if (!formdata3.accountname.trim()) {
            setSaveState3("failed")  
            setErrorMessage("Please enter account name!")        
        }else if (!formdata3.accountno.trim()) {
            setSaveState3("failed")  
            setErrorMessage("Please enter account number!")                    
        }else{

            try{  
                setSaveState3("saving")  
                let params = {...formdata3, 
                    id: paramId                   
                }            
                const ret =  await callApi("/profile/payout", "POST", params) 
                if (ret.status==200){                                
                    setSaveState3("success")      
                    toast.success('Changes successfully saved!')
                    init(paramId)
                }else{
                    setSaveState3("failed")
                    setErrorMessage(ret.message)
                }
                // // console.log(formd)
                // setSaveState3("saving")      
                // setTimeout(() => {
                //     setSaveState3("success")      
                //     toast.success('Changes successfully saved!')
                // }, 3000);   

            }catch(err){
                setSaveState2("failed")
                console.log(err)                
            }
        }
    }

    const handleChangeProv = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm2({ ...formdata2, province: e, city: null })
        filterCities(e, cities)
    }


    const handleChangeCity = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm2({ ...formdata2, city: e })
    }

    const handleChange = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm({ ...formdata, [e.target.name]: e.target.value })
    }

    const handleChangeDate = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm({ ...formdata, 
            birthdate: e
        })
    }

    const handleUploadChange = async (e) => {
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        if (e.target.files.length>0){
            const pho = await readFile(e.target.files[0])
            let new_id = `${new Date().getTime()}`
            const obj = { id: new_id, path: pho}            
            setphoto(obj)        
        }           
    }

     const handleChange2 = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm2({ ...formdata2, [e.target.name]: e.target.value })
    }

    const handleChange3 = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm3({ ...formdata3, [e.target.name]: e.target.value })
    }

    const handleChange4 = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm4({ ...formdata4, [e.target.name]: e.target.value })
    }

    const handleShowPwd=()=>{
        showPassword(!pwdShown)
    }

    const handleConfirmShowPwd=()=>{
        showConfirmPassword(!confirmPwdShown)
    }
    
    const handleChangePm = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setErrorMessage("")
        setForm3({ ...formdata3, paymethod: e })
    }

    const handleYes = ()=>{
        setshowConfirm(false)
        if (card==0){
            savePI()
        }else  if (card==1){
            savePA()
        }else  if (card==2){
            savePayout()
        }
    }

    const handleBeneficiarySaved = ()=>{
        window.location.reload();
    }

    const readFile = (img) => {
        return new Promise((res) => {
            const reader = new FileReader();
            reader.onload = function (o) {
                const image = new Image();
                image.src = reader.result;
                image.onload = function() {
                    if(image.width < 120 || image.height < 120){
                        // seterrorMessage("Photo is too small. Should be at least 120 x 120.")                         
                         toast('Photo is too small. Should be at least 120 x 120.',
                            {
                              icon: '❌',
                              style: {
                                borderRadius: '10px',
                                background: '#333',
                                color: '#fff',
                              },
                            }
                          );                        
                    } else {
                        res(o.target.result)
                    }
                };
            }
            reader.readAsDataURL(img);
        })
    }

    var photoBog = ""    
    if (photo){
        photoBog =  <div className='bg-[#fff] border border-[#fff] rounded-full p-1'>                              
                        <img alt="H2c" src={photo.path} width={140} height={140} className="rounded-full h-[140px] w-[140px]"/>                        
                    </div> 
    }else{
        if (formdata.photo){
            photoBog = <div className='bg-[#fff] border border-[#fff] rounded-full p-1'>                              
                        <img alt="H2c" src={formdata.photo} width={140} height={140} className="rounded-full h-[140px] w-[140px]"/>                        
                    </div> 
         }else{
            photoBog = <div className='bg-[#fff] border border-[#fff] rounded-full p-1'>                            
                    <img alt="H2c" src={UserPic.src} width={140} height={140} className="rounded-full h-[140px] w-[140px]"/>
                </div> 
         }
      
    }


    let content = <PreLoader/>

    
    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                   
    }

    if (loadstate==="success"){
        content = <div className='space-y-5 lg:grid lg:grid-cols-2 gap-5'>
                    <div className='space-y-5'>
                        <div className='bg-white  rounded-xl p-8'>
                            <div className="border-b border-dotted border-gray-300 pb-3">
                                <h3 className="font-semibold text-xl text-[#707a91]">Personal Information</h3>                                                 
                            </div>
                            { saveState=="failed" && errorBox}
                            <div className='flex gap-6 mt-5'>                      
                                {photoBog}
                            <div className='flex items-center'>
                                    <input type="file"
                                        id="uploadBtn"
                                        multiple
                                        accept="image/*"
                                        className="custom-file-input hidden"
                                        onChange={handleUploadChange}/>                                                    
                                    <label className="btn-primary" htmlFor="uploadBtn">
                                            Upload Photo
                                    </label>      
                                </div>
                                
                            </div>
                            <div className="border-b border-dotted border-gray-300 py-2">                        
                            </div>
                            <div className='space-y-5 mt-6'>
                                <div>                            
                                    <div className='space-y-3 md:grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className="md:text-lg font-medium block text-[#404758] mb-4">First Name <span className='text-red-500 text-xs'>*</span> </label>
                                            <input
                                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="First Name" id="fname" value={formdata.fname} type="text" name='fname' onChange={handleChange}/>
                                        </div>
                                        <div>
                                            <label className="md:text-lg font-medium block text-[#404758] mb-4">Middle Name <span className='text-red-500 text-xs'>*</span> </label>
                                            <input
                                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Middle Name" id="mname" value={formdata.mname} type="text" name='mname' onChange={handleChange}/>       
                                        </div>                                                      
                                    </div>
                                    
                                    <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className="md:text-lg font-medium block text-[#404758] mb-4">Last Name <span className='text-red-500 text-xs'>*</span> </label>
                                            <input
                                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Last Name" id="lname" value={formdata.lname} type="text" name='lname' onChange={handleChange}/>
                                        </div>
                                        <div>
                                            <label className="md:text-lg font-medium block text-[#404758] mb-4">Birthdate <span className='text-red-500 text-xs'>*</span> </label>
                                            <Datepicker value={formdata.birthdate} onChange={handleChangeDate} />
                                        </div>
                                    </div>

                                    <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className="md:text-lg font-medium block text-[#404758] mb-4">Email <span className='text-red-500 text-xs'>*</span> </label>
                                            <input
                                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Email Address" id="email" value={formdata.email} type="email" name='email' onChange={handleChange}/>
                                        </div>
                                        <div>
                                            <label className="md:text-lg font-medium block text-[#404758] mb-4">Contact Number <span className='text-red-500 text-xs'>*</span> </label>
                                            <input
                                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Contact Number" id="contactno" value={formdata.contactno} type="text" name='contactno' onChange={handleChange}/>
                                        </div>                                                      
                                    </div>
                                     <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className="md:text-lg font-medium block text-[#404758] mb-4">Username </label>
                                            <input
                                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2  disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="" id="username" value={formdata.username} disabled type="text" name='usenrame' />
                                        </div>
                                        <div>
                                           
                                        </div>                                                      
                                    </div>
                                    <div className='py-4'>
                                        <PrimaryBtn type="button"  onClick={handleSave}  isLoading={saveState==="saving"}>Save Changes</PrimaryBtn>          
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='bg-white rounded-xl p-8'>
                            <div className="border-b border-dotted border-gray-300 pb-3">
                                <h3 className="font-semibold text-xl text-[#707a91]">Payout Information</h3>  
                                {/* <p className='text-sm text-gray-500 mt-1'>Choose your preferred payout method. Please be advise that once you save your payment method, any changes shall be upon request and approval of admin.</p>                                                */}
                            </div>
                            { saveState3=="failed" && errorBox}
                            <div className='space-y-5 mt-6'>                                   
                                <div>
                                    <label className="md:text-lg font-medium block text-[#404758] mb-4">Select your default payout method <span className='text-red-500 text-xs'>*</span> </label>
                                    <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle}  options={pm} value={formdata3.paymethod}  onChange={handleChangePm} />                            
                                </div>
                                <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Enter Account Name <span className='text-red-500 text-xs'>*</span> </label>
                                         <input className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="" id="accountname" value={formdata3.accountname} type="text" name='accountname' onChange={handleChange3}/>
                                    </div>                                   
                                </div>        
                                <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Enter Account/Mobile Number <span className='text-red-500 text-xs'>*</span> </label>
                                         <input className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2  disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="" id="accountno" value={formdata3.accountno} type="text" name='accountno' onChange={handleChange3}/>
                                    </div>                                   
                                </div>                                  
                            </div>
                            <div className='py-4'>
                               <PrimaryBtn type="button"  onClick={handleSave3}  isLoading={saveState3==="saving"}>Save Changes</PrimaryBtn>                                  
                            </div>
                        </div>
                    </div>
                    <div className='space-y-5'>
                        <div className='bg-white rounded-xl  p-6'>
                            <div className="border-b border-dotted border-gray-300 pb-3">
                                <h3 className="font-semibold text-xl text-[#707a91]">Address</h3>                         
                            </div>
                            { saveState2=="failed" && errorBox}
                            <div className='space-y-5 mt-6'>
                                <div>
                                    <label className="md:text-lg font-medium block text-[#404758] mb-4">Address 1 <span className='text-red-500 text-xs'>*</span> </label>
                                    <input
                                        className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Address 1" id="address1" value={formdata2.address1} type="text" name='address1' onChange={handleChange2}/>
                                </div>
                                <div>
                                    <label className="md:text-lg font-medium block text-[#404758] mb-4">Address 2</label>
                                    <input
                                        className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Address 2" id="address2" value={formdata2.address2} type="text" name='address2' onChange={handleChange2}/>
                                </div>
                                <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Province <span className='text-red-500 text-xs'>*</span> </label>
                                        <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={provinces} value={formdata2.province}   onChange={handleChangeProv} />                            
                                    </div>
                                    <div>
                                        <label className="md:text-lg font-medium block text-[#404758] mb-4">City <span className='text-red-500 text-xs'>*</span> </label>
                                        <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={filteredCities} value={formdata2.city}   onChange={handleChangeCity} />                            
                                    </div>

                                </div>
                                <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Zip Code<span className='text-red-500 text-xs'>*</span> </label>
                                        <input
                                            className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="zipcode 1" id="zipcode" value={formdata2.zipcode} type="text" name='zipcode' onChange={handleChange2}/>
                                        </div>
                                        <div>                                    
                                    </div>
                                </div>                               
                            </div>
                            <div className='py-4'>
                                <PrimaryBtn type="button"  onClick={handleSave2}  isLoading={saveState2==="saving"}>Save Changes</PrimaryBtn>          
                            </div>
                        </div>
                        <div className='bg-white rounded-xl p-8'>
                            <div className="border-b border-dotted border-gray-300 pb-3">
                                <h3 className="font-semibold text-xl text-[#707a91]">Change Password</h3>                                                 
                            </div>   
                            { saveState4=="failed" && errorBox}
                            <div className='space-y-5 mt-6'>
                                <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Enter New Password<span className='text-red-500 text-xs'>*</span> </label>
                                        <div className="border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-4 relative ">
                                                <input className="w-11/12 text-sm bg-transparent focus:outline-none" 
                                                        placeholder="Enter Your Password" 
                                                        id="password" 
                                                        required="" 
                                                        type={pwdShown?'text':'password'} 
                                                        maxLength={20}
                                                        value={formdata4.password}
                                                        name='password' onChange={handleChange4}/>
                                                        <button className="absolute ltr:right-5 rtl:left-5 top-1/2 cursor-pointer -translate-y-1/2" onClick={handleShowPwd}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-eye-off ">
                                                                <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"></path><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"></path><path d="M3 3l18 18"></path>
                                                            </svg>
                                                        </button>
                                            </div>
                                    </div>
                                    <div>                                    
                                    </div>
                                </div>      
                                <div className='space-y-2 md:grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className="md:text-lg font-medium block text-[#404758] mb-4">Confirm Password<span className='text-red-500 text-xs'>*</span> </label>
                                        <div className="border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-4 relative ">
                                                <input className="w-11/12 text-sm bg-transparent focus:outline-none" 
                                                        placeholder="Confirm Password" 
                                                        id="confirmpass" 
                                                        required="" 
                                                        type={confirmPwdShown?'text':'password'} 
                                                        maxLength={20}
                                                        value={formdata4.confirmpass}
                                                        name='confirmpass' onChange={handleChange4}/>
                                                        <button className="absolute ltr:right-5 rtl:left-5 top-1/2 cursor-pointer -translate-y-1/2" onClick={handleConfirmShowPwd}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-eye-off ">
                                                                <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"></path><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"></path><path d="M3 3l18 18"></path>
                                                            </svg>
                                                        </button>
                                            </div>
                                    </div>
                                    <div>                                    
                                    </div>
                                </div>       
                            </div>                         
                            <div className='py-4'>
                                <PrimaryBtn type="button"  onClick={handleSave4}  isLoading={saveState4==="saving"}>Save Changes</PrimaryBtn>          
                            </div>
                        </div>
                        <Beneficiary onSaved={handleBeneficiarySaved} paramId={paramId} beneficiaries={beneficiaries}/>
                        <Confirm showConfirm={showConfirm} setshowConfirm={setshowConfirm} onYes={handleYes} card={card}/>                      
                    </div>
                </div>
        
    }
    


    // console.log(formdata)

    return (
        
        <div className={`${interFont.className}  w-full px-6 pb-10`}>
                <button type="button" className='py-2 px-6 bg-white rounded-full shadow-sm flex gap-2 mb-4' onClick={()=>router.back()}>
                    <ArrowLeft className='h-6 w-6 text-[#3cadd2c2]'/>
                    <span>Back</span> 
                </button>
            {content}
            <Toaster position="top-center" reverseOrder={false}/>
        </div>
    )
}

