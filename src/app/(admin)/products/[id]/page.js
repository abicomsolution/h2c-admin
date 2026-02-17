"use client"
import DataTable from 'react-data-table-component';
import React, { useEffect, useState} from 'react';
import { Search } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePageTitle } from "@/context/PageTitleProvider";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import moment from 'moment';
import { TriangleAlert, ArrowLeft } from "lucide-react";
import PrimaryBtn from "@/components/primaryBtn";
import CancelBtn from '@/components/cancelBtn';
import toast, { Toaster } from 'react-hot-toast';
import NoPhoto from '../../../../assets/product.png'
import Select from 'react-select'
import { Checkbox, Label } from "flowbite-react";
import _ from 'lodash';

const initForm = {
	_id: '',
	category_id: null,
    code: '',
    productname: '',    
    description: '',
    benefits: '', 
    uom: '',
    weight: 0,
    price: 0,
    member_price: 0,    
    hub_price: 0,
    hub_profit: 0,
    h2c_wallet: 0,
    stairstep_alloc: 0,
    unilevel_alloc: 0,    
    photo_thumb: '',
    isMembership: false,
    isProdPackage: false,    
    isActive: false,
    packageType: 0,
    unit_cost: 0,
    min_stock_level: 0,
    isNonInventory: false,
    isHidden: false,	
}


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


export default function Product(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false) 
    const { updatePageTitle } = usePageTitle();
    const params = useParams();

    const router = useRouter();
    const [formdata, setForm] = useState(initForm);
    const [photo, setphoto] = useState(null)
    const [loadstate, setloadstate] = useState("")    
    const [saveState, setSaveState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")    
    const [categories, setCategories] = useState([])
        
    useEffect(() => {
    
        if (session.status === "unauthenticated") {
            router.replace("/login");
        }else if (session.status=="authenticated"){                 
            setinitialized(true)                
        }
    
    }, [session])


    useEffect(() => {
        
        if (initialized){        
            init()   
        }
        
    }, [initialized])

    // Update page title based on whether it's add or edit mode
    useEffect(() => {
        const productId = params?.id;
        
        if (productId === 'add') {
            console.log("Calling updatePageTitle with: Add Product");
            updatePageTitle('Add Product');
        } else if (productId && productId !== 'add') {
            console.log("Calling updatePageTitle with: Edit Product");
            updatePageTitle('Edit Product');
        }
              
    }, [params?.id, updatePageTitle]);


    const init = async ()=>{
        
        setloadstate("loading")     
        try{        
            const productId = params?.id;                  
            const ret =  await callApi(`/product/${productId}`, "GET") 
            if (ret.status==200){                 
                    
                setCategories(ret.data.categories)
                if (ret.data.product){
                    setForm(ret.data.product)
                }
                
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
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

     const handleUploadChange = async (e) => {
        setSaveState("")      
        setErrorMessage("")
        if (e.target.files.length>0){
            const pho = await readFile(e.target.files[0])
            let new_id = `${new Date().getTime()}`
            const obj = { id: new_id, path: pho}            
            setphoto(obj)        
        }           
    }

    const handleChange = (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, [e.target.name]: e.target.value })
    }

    const handleChangeCat = (selectedOption)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, category_id: selectedOption })
    }

    const handleChangeActive= (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, isActive: !formdata.isActive })
    }

    const handleChangeNonInventory= (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, isNonInventory: !formdata.isNonInventory })
    }

    const handleChangeProdPackage= (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, isProdPackage: !formdata.isProdPackage })
    }

    const handleChangeMembership= (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, isMembership: !formdata.isMembership })
    }

    const handleChangeHidden= (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, isHidden: !formdata.isHidden })
    }

    const handleSave = async ()=>{
      
        if (_.isEmpty(formdata.photo_thumb) && _.isEmpty(photo)) {
            setErrorMessage("Please upload photo.")
        } else if (_.isEmpty(formdata.code.trim())) {
			setErrorMessage('Please enter product code!')
		} else if (_.isEmpty(formdata.category_id)) {
			setErrorMessage('Please choose product category!')
		} else if (_.isEmpty(formdata.productname.trim())) {
			setErrorMessage('Please enter product name!')
		} else if (_.isEmpty(formdata.uom.trim())) {
			setErrorMessage('Please enter unit of measurement!')
        }else if (_.isEmpty(formdata.description.trim())) {
			setErrorMessage('Please enter product description!')
        } else if (Number(formdata.price) <= 0) {
			setErrorMessage('Please enter SRP!')
		} else if (Number(formdata.member_price) <= 0) {
			setErrorMessage("Please enter member's price!")
		}else{

            try{
                setSaveState("saving") 
                let url = ""
                let data = {}
                console.log(params?.id)
                if (params?.id==='add'){
                    data = { ...formdata, photo: photo }
                    url = "/product/savenew"
                }else{
                    data = { ...formdata, photo: photo, id: formdata._id }
                    url = "/product/update"
                }
                
                const ret =  await callApi(url, "POST", data) 
                if (ret.status==200){                
                    setSaveState("success")                    
                    router.replace("/products/"+ret.data)
                    toast.success('Product successfully saved!')
                }else{              
                     setSaveState("") 
                     setErrorMessage(ret.name)
                }
                // setTimeout(() => {
                //     setSaveState("success")
                //     toast.success('Product successfully saved!')
                // }, 2000);
                setErrorMessage("") 
            }catch(err){
                console.log(err)
                setSaveState("") 
                setErrorMessage("An error occured. Please try again.") 
            }

        }
    }

    const handleCancel = async (e)=>{
        router.back()
    }

    let content = <PreLoader/>

  
 
    var photoBog = ""    
    if (photo){
        photoBog =  <div className='bg-[#fff] border border-[#fff] rounded-3xl p-1'>                              
                        <img alt="H2c" src={photo.path} width={200} height={200} className="rounded-3xl h-[200px] w-[200px]"/>                        
                    </div> 
    }else{
        if (formdata.photo_thumb){
            photoBog = <div className='bg-[#fff] border border-[#fff] rounded-3xl p-1'>                              
                        <img alt="H2c" src={formdata.photo_thumb} width={200} height={200} className="rounded-3xl h-[200px] w-[200px]"/>                        
                    </div> 
            }else{
            photoBog = <div className='bg-[#f1f1f1] border border-[#fff] rounded-3xl p-1'>                            
                    <img alt="H2c" src={NoPhoto.src} width={200} height={200} className="rounded-3xl h-[200px] w-[200px]"/>
                </div> 
            }
        
    }

    if (loadstate==="success"){
        content = ""
    }

    var packageTypeBox = <div className="-mt-2 ml-2">
                                <Checkbox id="isProdPackage" checked={formdata.isProdPackage} onChange={handleChangeProdPackage}/>
                                <Label htmlFor="isProdPackage" className="ml-3 text-base font-medium -mt-1">
                                    Is Product Package
                                </Label>
                            </div>

    var memberPack =  <div className="-mt-2 ml-2">
                        <Checkbox id="isMembership" checked={formdata.isMembership} onChange={handleChangeMembership}/>
                        <Label htmlFor="isMembership" className="ml-3 text-base font-medium -mt-1">
                            This is a Membership Package
                        </Label>
                    </div>

    if (formdata.isNonInventory) {            
        packageTypeBox = null	
    }

    if (!formdata.isProdPackage) {			
		memberPack = null	
	}

    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                   
    }

    return (
        <div className={`w-full px-6 pb-10`}>                    
            <div className="bg-white rounded-xl p-6 px-12">
                { errorBox}
                <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-12'>
                    <div className='space-y-5'>
                        <div className='flex gap-6'>                      
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
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Product Code <span className='text-red-500 text-xs'>*</span> </label>
                            <input
                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Product Code" id="code" value={formdata.code} type="text" name='code' onChange={handleChange}/>
                        </div>
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Province <span className='text-red-500 text-xs'>*</span> </label>
                            <Select  isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle} options={categories} value={formdata.category_id}   onChange={handleChangeCat} />                            
                        </div>
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Product Name <span className='text-red-500 text-xs'>*</span> </label>
                            <input
                                className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Product Name" id="name" value={formdata.productname} type="text" name='productname' onChange={handleChange}/>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Unit of Measurement <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Unit of Measurement" id="uom" value={formdata.uom} type="text" name='uom' onChange={handleChange}/>
                            </div>
                             <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Weight (kg)<span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Weight" id="weight" value={formdata.weight} type="number" name='weight' onChange={handleChange}/>
                            </div>
                        </div>            
                         <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Unit Cost <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Unit Cost" id="unit_cost" value={formdata.unit_cost} type="number" name='unit_cost' onChange={handleChange}/>
                            </div>
                             <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Minimum Stock Level <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Minimum Stock Level" id="min_stock_level" value={formdata.min_stock_level} type="number" name='min_stock_level' onChange={handleChange}/>
                            </div>
                        </div>   
                            
                    </div>
                    <div className='space-y-5'>
                         <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Product Description <span className='text-red-500 text-xs'>*</span> </label>
                            <textarea
                                className="w-full h-32 text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="description" value={formdata.description} type="text" name='description' onChange={handleChange}/>                                
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">SRP <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="price" value={formdata.price} type="number" name='price' onChange={handleChange}/>
                            </div>
                             <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Member&apos;s Price <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="member_price" value={formdata.member_price} type="number" name='member_price' onChange={handleChange}/>
                            </div>
                        </div>   
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Hub&apos;s Price <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="hub_price" value={formdata.hub_price} type="number" name='hub_price' onChange={handleChange}/>
                            </div>
                             <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Hub Profit<span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="hub_profit" value={formdata.hub_profit} type="number" name='hub_profit' onChange={handleChange}/>
                            </div>
                        </div>   
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">H2C Wallet <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="h2c_wallet" value={formdata.h2c_wallet} type="number" name='h2c_wallet' onChange={handleChange}/>
                            </div>
                             <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Stairstep Allocation<span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="stairstep_alloc" value={formdata.stairstep_alloc} type="number" name='stairstep_alloc' onChange={handleChange}/>
                            </div>
                        </div>   
                         <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Unilevel Allocation <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 mb-5 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="unilevel_alloc" value={formdata.unilevel_alloc} type="number" name='unilevel_alloc' onChange={handleChange}/>
                            </div>
                             <div>
                               
                            </div>
                        </div>   
                        <div className='space-y-5'>
                            <div className="-mt-2 ml-2">
                                <Checkbox id="isActive" checked={formdata.isActive} onChange={handleChangeActive}/>
                                <Label htmlFor="isActive" className="ml-3 text-base font-medium -mt-1">
                                    Is Active
                                </Label>
                            </div>
                            <div className="-mt-2 ml-2">
                                <Checkbox id="isNonInventory" checked={formdata.isNonInventory} onChange={handleChangeNonInventory}/>
                                <Label htmlFor="isNonInventory" className="ml-3 text-base font-medium -mt-1">
                                    Is Non&#8209;Inventory
                                </Label>
                            </div>
                            {packageTypeBox}
                            {memberPack}
                            <div className="-mt-2 ml-2">
                                <Checkbox id="isHidden" checked={formdata.isHidden} onChange={handleChangeHidden}/>
                                <Label htmlFor="isHidden" className="ml-3 text-base font-medium -mt-1">
                                    Hide in Online Store
                                </Label>
                            </div>
                        </div>          
                    </div>
                </div>
                 <div className="border-b border-dotted border-gray-300 py-2">                        
                </div>
                <div className='py-4 flex justify-between'>
                    <CancelBtn type="button"  onClick={handleCancel}>Back</CancelBtn>     
                    <PrimaryBtn type="button"  onClick={handleSave}  isLoading={saveState==="saving"}>Save Changes</PrimaryBtn>                             
                </div>
            </div>                  
            <Toaster position="top-center" reverseOrder={false}/>
        </div>
    )
}

