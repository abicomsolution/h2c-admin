"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import callApi from "@/utils/api-caller";
import NoRecord from "@/components/NoRecord";
import moment from "moment";
import { TUSER } from '@/utils/constants';
import PreLoader from '@/components/preloader';
import UserPic from '../../../assets/no_photo.png'
import PrimaryBtn from '@/components/primaryBtn';
import { Datepicker,  Label, Radio   } from "flowbite-react";
import { TriangleAlert, ArrowLeft, User, MapPin, Lock, CreditCard, Crown, Users } from "lucide-react";
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

const tmpForm5 = {
    isHub: false,
    hubtype: 0,
    hub_province: null,    
    hub_city: null
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

    const [formdata5, setForm5] = useState(tmpForm5)
    const [saveState5, setSaveState5] = useState("")  
    const [filteredHubCities, setFilteredHubCities] = useState([]) 
    
  

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

     const filterHubCities=(selectedProv, cities, type)=>{
		var newCities = cities.filter((obj)=>{
			return obj.province==selectedProv.value && obj?.city==type
		})

		setFilteredHubCities(newCities);
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

                let newForm5 = {
                    isHub: ret.data.profile.isHub,
                    hubtype: ret.data.profile.hubtype,
                    hub_province: ret.data.profile.hub_province,
                    hub_city: ret.data.profile.hub_city
                }
                if (ret.data.profile.hub_province){
                    if (ret.data.profile.hubtype!=2){
                        filterHubCities(ret.data.profile.hub_province, ret.data.cities, ret.data.profile.hubtype)
                    }
                }
                setForm5(newForm5)

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


    const handleSave5 = async ()=>{
        setcard(5)
        if (formdata5.hub_province == null) {
            setSaveState5("failed")  
            setErrorMessage("Please choose province!")
         }else if (formdata5.hubtype!==2 && !formdata5.hub_city){
            setSaveState5("failed")  
            setErrorMessage(formdata5.hubtype===1 ? "Please select city." : "Please select municipality.")
        }else{
            try{  
                setSaveState5("saving")  
                let params = {...formdata5, 
                    id: paramId                   
                }
                console.log(params)
                const ret =  await callApi("/profile/hub", "POST", params) 
                if (ret.status==200){                                
                    setSaveState5("success")      
                    toast.success('Hub information changes successfully saved!')
                    init(paramId)
                }else{
                    setSaveState5("failed")
                    setErrorMessage(ret.message)
                }
                // // console.log(formd)
                // setSaveState5("saving")      
                // setTimeout(() => {
                //     setSaveState5("success")      
                //     toast.success('Hub information changes successfully saved!')
                //     init(paramId)
                // }, 3000);   

            }catch(err){
                setSaveState5("failed")
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
        setSaveState5("")
        setErrorMessage("")
        setForm2({ ...formdata2, province: e, city: null })
        filterCities(e, cities)
    }

    const handleHubChangeProv = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
        setErrorMessage("")
        setForm5({ ...formdata5, hub_province: e, hub_city: null })
        if (formdata5.hubtype!=2){
            filterHubCities(e, cities, formdata5.hubtype)
        }        
    }

    const handleChangeHubCity = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
        setErrorMessage("")
        setForm5({ ...formdata5, hub_city: e })
    }

    const handleChangeCity = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
        setErrorMessage("")
        setForm2({ ...formdata2, city: e })
    }

    const handleChange = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
        setErrorMessage("")
        setForm({ ...formdata, [e.target.name]: e.target.value })
    }

    const handleChangeDate = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
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
        setSaveState5("")
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
        setSaveState5("")
        setErrorMessage("")
        setForm2({ ...formdata2, [e.target.name]: e.target.value })
    }

    const handleChange3 = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
        setErrorMessage("")
        setForm3({ ...formdata3, [e.target.name]: e.target.value })
    }

    const handleChange4 = (e)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
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
        setSaveState5("")
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

    const handChangeType = (i)=>{
        setSaveState("")
        setSaveState2("")
        setSaveState3("")
        setSaveState4("")
        setSaveState5("")
        setErrorMessage("")
        setForm5({ ...formdata5, hubtype: i, hub_province: null, hub_city: null })

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


    let content = <PreLoader />

    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { id: 0, name: 'Personal', icon: User },
        { id: 1, name: 'Address', icon: MapPin },
        { id: 2, name: 'Payout', icon: CreditCard },
        { id: 3, name: 'Password', icon: Lock },
        ...(formdata5.isHub ? [{ id: 4, name: 'Hub', icon: Crown }] : []),
        { id: 5, name: 'Beneficiaries', icon: Users },
    ];
    
    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-red-50 border border-red-200 p-3 rounded-lg my-4 items-start">
                    <TriangleAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span className="text-sm font-medium text-red-800">{errorMessage}</span>
                </div>
    }

    if (loadstate === "success") {
        content = (
            <div className="w-full">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm whitespace-nowrap transition ${
                                    activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <IconComponent size={18} />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {/* Personal Information */}
                    {activeTab === 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                            {saveState === "failed" && errorBox}
                            
                            {/* Photo Upload Section */}
                            <div className="mb-8 pb-8 border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-600 mb-4">Profile Photo</p>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                                        {formdata.photo ? (
                                            <img src={formdata.photo} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id="uploadBtn"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleUploadChange}
                                        />
                                        <label htmlFor="uploadBtn" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium">
                                            Change Photo
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="First Name"
                                            value={formdata.fname}
                                            type="text"
                                            name="fname"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Middle Name"
                                            value={formdata.mname}
                                            type="text"
                                            name="mname"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Last Name"
                                            value={formdata.lname}
                                            type="text"
                                            name="lname"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Birthdate <span className="text-red-500">*</span></label>
                                        <Datepicker value={formdata.birthdate} onChange={handleChangeDate} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Email Address"
                                            value={formdata.email}
                                            type="email"
                                            name="email"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contact Number"
                                            value={formdata.contactno}
                                            type="text"
                                            name="contactno"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        value={formdata.username}
                                        disabled
                                        type="text"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <PrimaryBtn type="button" onClick={handleSave} isLoading={saveState === "saving"}>
                                    Save Changes
                                </PrimaryBtn>
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {activeTab === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Address Information</h2>
                            {saveState2 === "failed" && errorBox}
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address 1 <span className="text-red-500">*</span></label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Street Address"
                                        value={formdata2.address1}
                                        type="text"
                                        name="address1"
                                        onChange={handleChange2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Apartment, suite, etc."
                                        value={formdata2.address2}
                                        type="text"
                                        name="address2"
                                        onChange={handleChange2}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Province <span className="text-red-500">*</span></label>
                                        <Select
                                            isClearable={true}
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            styles={controlStyle}
                                            options={provinces}
                                            value={formdata2.province}
                                            onChange={handleChangeProv}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                                        <Select
                                            isClearable={true}
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            styles={controlStyle}
                                            options={filteredCities}
                                            value={formdata2.city}
                                            onChange={handleChangeCity}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code <span className="text-red-500">*</span></label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Zip Code"
                                        value={formdata2.zipcode}
                                        type="text"
                                        name="zipcode"
                                        onChange={handleChange2}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <PrimaryBtn type="button" onClick={handleSave2} isLoading={saveState2 === "saving"}>
                                    Save Changes
                                </PrimaryBtn>
                            </div>
                        </div>
                    )}

                    {/* Payout Information */}
                    {activeTab === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payout Information</h2>
                            {saveState3 === "failed" && errorBox}
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method <span className="text-red-500">*</span></label>
                                    <Select
                                        isClearable={true}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                        styles={controlStyle}
                                        options={pm}
                                        value={formdata3.paymethod}
                                        onChange={handleChangePm}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name <span className="text-red-500">*</span></label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Account Name"
                                        value={formdata3.accountname}
                                        type="text"
                                        name="accountname"
                                        onChange={handleChange3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account/Mobile Number <span className="text-red-500">*</span></label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter Account Number"
                                        value={formdata3.accountno}
                                        type="text"
                                        name="accountno"
                                        onChange={handleChange3}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <PrimaryBtn type="button" onClick={handleSave3} isLoading={saveState3 === "saving"}>
                                    Save Changes
                                </PrimaryBtn>
                            </div>
                        </div>
                    )}

                    {/* Password */}
                    {activeTab === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                            {saveState4 === "failed" && errorBox}
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter Your New Password"
                                            type={pwdShown ? "text" : "password"}
                                            maxLength={20}
                                            value={formdata4.password}
                                            name="password"
                                            onChange={handleChange4}
                                        />
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={handleShowPwd}
                                            type="button"
                                        >
                                            {pwdShown ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm Your Password"
                                            type={confirmPwdShown ? "text" : "password"}
                                            maxLength={20}
                                            value={formdata4.confirmpass}
                                            name="confirmpass"
                                            onChange={handleChange4}
                                        />
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={handleConfirmShowPwd}
                                            type="button"
                                        >
                                            {confirmPwdShown ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <PrimaryBtn type="button" onClick={handleSave4} isLoading={saveState4 === "saving"}>
                                    Save Changes
                                </PrimaryBtn>
                            </div>
                        </div>
                    )}

                    {/* Hub Information - only show if user is a Hub */}
                    {activeTab === 4 && formdata5.isHub && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hub Information</h2>
                            {saveState5 === "failed" && errorBox}
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">Hub Type <span className="text-red-500">*</span></label>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex items-center gap-3">
                                            <Radio id="municipal" value={0} checked={formdata5.hubtype === 0} onChange={() => handChangeType(0)} />
                                            <label htmlFor="municipal" className="text-sm font-medium cursor-pointer">Municipal Hub</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Radio id="city" value={1} checked={formdata5.hubtype === 1} onChange={() => handChangeType(1)} />
                                            <label htmlFor="city" className="text-sm font-medium cursor-pointer">City Hub</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Radio id="province" value={2} checked={formdata5.hubtype === 2} onChange={() => handChangeType(2)} />
                                            <label htmlFor="province" className="text-sm font-medium cursor-pointer">Provincial Hub</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Province <span className="text-red-500">*</span></label>
                                        <Select
                                            isClearable={true}
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            styles={controlStyle}
                                            options={provinces}
                                            value={formdata5.hub_province}
                                            onChange={handleHubChangeProv}
                                        />
                                    </div>
                                    {formdata5.hubtype !== 2 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {formdata5.hubtype === 1 ? "City" : "Municipality"} <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                isClearable={true}
                                                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                styles={controlStyle}
                                                options={filteredHubCities}
                                                value={formdata5.hub_city}
                                                onChange={handleChangeHubCity}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <PrimaryBtn type="button" onClick={handleSave5} isLoading={saveState5 === "saving"}>
                                    Save Changes
                                </PrimaryBtn>
                            </div>
                        </div>
                    )}

                    {/* Beneficiaries */}
                    {activeTab === 5 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Beneficiaries</h2>
                            <Beneficiary onSaved={handleBeneficiarySaved} paramId={paramId} beneficiaries={beneficiaries} />
                        </div>
                    )}
                </div>

                <Confirm showConfirm={showConfirm} setshowConfirm={setshowConfirm} onYes={handleYes} card={card} />
            </div>
        );
    }


    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-3 sm:px-6 py-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <button 
                    type="button" 
                    className='flex items-center gap-2 mb-8 px-4 py-2 hover:bg-white rounded-lg transition'
                    onClick={() => router.back()}
                >
                    <ArrowLeft className='h-5 w-5 text-blue-600' />
                    <span className="font-medium text-gray-700">Back</span>
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account information</p>
                </div>

                {content}
            </div>
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    )
}

