"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePageTitle } from "@/context/PageTitleProvider";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import { TriangleAlert, ArrowLeft, Upload, ImagePlus } from "lucide-react";
import PrimaryBtn from "@/components/primaryBtn";
import CancelBtn from '@/components/cancelBtn';
import toast, { Toaster } from 'react-hot-toast';
import NoPhoto from '../../../../assets/product.png'
import Select from 'react-select'
import { Checkbox, Label } from "flowbite-react";
import { CODETYPE } from '@/utils/constants';
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
    pv: 0
}


const selectStyles = {    
    menuPortal: provided => ({ ...provided, zIndex: 9999 }),
    menu: provided => ({ ...provided, zIndex: 9999, borderRadius: '12px', overflow: 'hidden' }),
    control: (baseStyles, state) => ({
        ...baseStyles,      
        padding: "6px 8px",
        borderRadius: "12px",
        borderColor: state.isFocused ? "#94a3b8" : "#e2e8f0",
        backgroundColor: "#f8fafc",
        fontSize: "14px",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(186,230,253,0.4)" : "none",
        '&:hover': { borderColor: "#cbd5e1" },
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: "14px",
        backgroundColor: state.isSelected ? "#f1f5f9" : state.isFocused ? "#f8fafc" : "#fff",
        color: "#334155",
    }),
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
const labelClass = "text-sm font-semibold text-slate-700"


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

    const handleChangePackageType = (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, packageType: Number(e.target.value) })
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

    // Photo display
    const photoSrc = photo ? photo.path : formdata.photo_thumb || null;

    let packageTypeBox = null
    if (!formdata.isNonInventory) {
        packageTypeBox = (
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    <Checkbox id="isProdPackage" checked={formdata.isProdPackage} onChange={handleChangeProdPackage}/>
                </div>
                <div>
                    <Label htmlFor="isProdPackage" className="text-sm font-semibold text-slate-700">Product Package</Label>
                    <p className="text-xs text-slate-400">Mark if this product is sold as a package.</p>
                </div>
            </div>
        )
    }

    let memberPack = null
    if (formdata.isProdPackage) {
        memberPack = (
            <>
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Checkbox id="isMembership" checked={formdata.isMembership} onChange={handleChangeMembership}/>
                    </div>
                    <div>
                        <Label htmlFor="isMembership" className="text-sm font-semibold text-slate-700">Membership Package</Label>
                        <p className="text-xs text-slate-400">Enable if this package grants membership.</p>
                    </div>
                </div>
                {formdata.isMembership && (
                    <div className="ml-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Package Type</p>
                        <div className="grid gap-2 sm:grid-cols-3">
                            {CODETYPE.map((item) => (
                                <label key={item.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-slate-300">
                                    <input
                                        type="radio"
                                        name="packageType"
                                        value={item.value}
                                        checked={formdata.packageType === item.value}
                                        onChange={handleChangePackageType}
                                        className="h-4 w-4 border-slate-300 text-slate-700"
                                    />
                                    <span className="font-medium">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )
    }

    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4 rounded-xl">
                    <TriangleAlert  className="h-6 w-6 text-white flex-shrink-0" strokeWidth={3} />
                    <span className="text-sm font-bold text-white">{errorMessage}</span>
                </div>
    }

    if (loadstate==="success"){
        content = ""
    }

    return (
        <div className="mt-4 px-2 pb-10">
            {/* Header */}
            <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-sm">
                <div className="absolute -right-24 -top-16 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl" />
                <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-amber-100/70 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Product Catalog</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-800">
                                {params?.id === 'add' ? 'Add New Product' : 'Edit Product'}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {params?.id === 'add' ? 'Fill in the details below to add a new product.' : 'Update the product information below.'}
                            </p>
                        </div>
                        <button onClick={handleCancel} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    </div>
                </div>
            </section>

            {errorBox}

            {content}

            {loadstate === "success" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">

                {/* Left Column */}
                <div className="flex flex-col gap-6">

                    {/* Photo Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">Product Photo</p>
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <div className="relative h-[180px] w-[180px] flex-shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                                {photoSrc ? (
                                    <img alt="Product" src={photoSrc} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                                        <ImagePlus className="h-10 w-10 text-slate-300" />
                                        <p className="text-xs text-slate-400">No photo</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" id="uploadBtn" multiple accept="image/*" className="hidden" onChange={handleUploadChange} />
                                <label htmlFor="uploadBtn" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-100">
                                    <Upload className="h-4 w-4" />
                                    Upload Photo
                                </label>
                                <p className="text-xs text-slate-400">Min 120 x 120px. JPG, PNG.</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">Basic Information</p>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label htmlFor="code" className={labelClass}>Product Code <span className="text-red-400">*</span></label>
                                <input className={inputClass + " mt-2"} placeholder="e.g. PROD-001" id="code" value={formdata.code} type="text" name="code" onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                                <div className="mt-2">
                                    <Select isClearable={true} menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={selectStyles} options={categories} value={formdata.category_id} onChange={handleChangeCat} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="productname" className={labelClass}>Product Name <span className="text-red-400">*</span></label>
                                <input className={inputClass + " mt-2"} placeholder="Enter product name" id="productname" value={formdata.productname} type="text" name="productname" onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="uom" className={labelClass}>UOM <span className="text-red-400">*</span></label>
                                    <input className={inputClass + " mt-2"} placeholder="e.g. pcs, box" id="uom" value={formdata.uom} type="text" name="uom" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="weight" className={labelClass}>Weight (kg)</label>
                                    <input className={inputClass + " mt-2"} placeholder="0" id="weight" value={formdata.weight} type="number" name="weight" onChange={handleChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="unit_cost" className={labelClass}>Unit Cost</label>
                                    <input className={inputClass + " mt-2"} placeholder="0" id="unit_cost" value={formdata.unit_cost} type="number" name="unit_cost" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="min_stock_level" className={labelClass}>Min Stock Level</label>
                                    <input className={inputClass + " mt-2"} placeholder="0" id="min_stock_level" value={formdata.min_stock_level} type="number" name="min_stock_level" onChange={handleChange} />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="pv" className={labelClass}>PV</label>
                                    <input className={inputClass + " mt-2"} placeholder="0" id="pv" value={formdata.pv} type="number" name="pv" onChange={handleChange} />
                                </div>
                                <div>                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">

                    {/* Description Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">Description</p>
                        <div>
                            <label htmlFor="description" className={labelClass}>Product Description <span className="text-red-400">*</span></label>
                            <textarea
                                className={inputClass + " mt-2 h-32 resize-none"}
                                placeholder="Write a brief description of the product..."
                                id="description" value={formdata.description} name="description" onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">Pricing</p>
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className={labelClass}>SRP <span className="text-red-400">*</span></label>
                                    <input className={inputClass + " mt-2"} placeholder="0.00" id="price" value={formdata.price} type="number" name="price" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="member_price" className={labelClass}>Member&apos;s Price <span className="text-red-400">*</span></label>
                                    <input className={inputClass + " mt-2"} placeholder="0.00" id="member_price" value={formdata.member_price} type="number" name="member_price" onChange={handleChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="hub_price" className={labelClass}>Hub&apos;s Price</label>
                                    <input className={inputClass + " mt-2"} placeholder="0.00" id="hub_price" value={formdata.hub_price} type="number" name="hub_price" onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="hub_profit" className={labelClass}>Hub Profit</label>
                                    <input className={inputClass + " mt-2"} placeholder="0.00" id="hub_profit" value={formdata.hub_profit} type="number" name="hub_profit" onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Allocations Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">Allocations</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="h2c_wallet" className={labelClass}>H2C Wallet</label>
                                <input className={inputClass + " mt-2"} placeholder="0.00" id="h2c_wallet" value={formdata.h2c_wallet} type="number" name="h2c_wallet" onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="stairstep_alloc" className={labelClass}>Stairstep</label>
                                <input className={inputClass + " mt-2"} placeholder="0.00" id="stairstep_alloc" value={formdata.stairstep_alloc} type="number" name="stairstep_alloc" onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="unilevel_alloc" className={labelClass}>Unilevel</label>
                                <input className={inputClass + " mt-2"} placeholder="0.00" id="unilevel_alloc" value={formdata.unilevel_alloc} type="number" name="unilevel_alloc" onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Settings Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-5">Settings</p>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Checkbox id="isActive" checked={formdata.isActive} onChange={handleChangeActive}/>
                                </div>
                                <div>
                                    <Label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Active</Label>
                                    <p className="text-xs text-slate-400">Product is visible and available for purchase.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Checkbox id="isNonInventory" checked={formdata.isNonInventory} onChange={handleChangeNonInventory}/>
                                </div>
                                <div>
                                    <Label htmlFor="isNonInventory" className="text-sm font-semibold text-slate-700">Non&#8209;Inventory</Label>
                                    <p className="text-xs text-slate-400">This product does not track stock levels.</p>
                                </div>
                            </div>
                            {packageTypeBox}
                            {memberPack}
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Checkbox id="isHidden" checked={formdata.isHidden} onChange={handleChangeHidden}/>
                                </div>
                                <div>
                                    <Label htmlFor="isHidden" className="text-sm font-semibold text-slate-700">Hide in Store</Label>
                                    <p className="text-xs text-slate-400">Product won't appear in the online store.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Footer Actions */}
            {loadstate === "success" && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                <CancelBtn type="button" onClick={handleCancel}>Back</CancelBtn>
                <PrimaryBtn type="button" onClick={handleSave} isLoading={saveState==="saving"}>Save Changes</PrimaryBtn>
            </div>
            )}

            <Toaster position="top-center" reverseOrder={false}/>
        </div>
    )
}

