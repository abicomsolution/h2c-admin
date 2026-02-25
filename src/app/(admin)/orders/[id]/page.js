"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePageTitle } from "@/context/PageTitleProvider";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import moment from 'moment';
import { TriangleAlert, ArrowLeft, Plus, ShoppingCart, User, CreditCard, Truck, ClipboardList, Settings } from "lucide-react";
import PrimaryBtn from "@/components/primaryBtn";
import CancelBtn from '@/components/cancelBtn';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select'
import { Checkbox, Label, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import _, { set } from 'lodash';
import { pad } from '@/utils/functions';
import { HUBTYPE } from '@/utils/constants';
import AddForm from './addform';
import EditForm from './editForm';
import { v4 } from 'uuid';
import ConfirmPost from './confirmPost';

const initForm = {
	member_id: null,
	order_num: '',
	transdate: moment().format("YYYY-MM-DD"),
    cash_payment: false,
    bank_payment: false,
    cc_payment: false,
    ewallet_payment: false,
	payment_ref_num: "",
	repeatorder: 0,
	hascodes: 0,
	hasactivationcodes: 0,
	last_modified_id: "",
	shipping_address: "",
	remarks: "",
	total_amount: 0,	
	subtotal: 0,
	totalvat: 0	
}

const initDtls = {
	order_header_id: null,
	product_id: null,
	price: 0,
	discountedprice: 0,
	qty: 1,
	discount: 0,
	subtotal: 0,
	uom: ""
}

const selectStyles = {    
    menuPortal: provided => ({ ...provided, zIndex: 9999 }),
    menu: provided => ({ ...provided, zIndex: 9999, borderRadius: '12px', overflow: 'hidden' }),
    control: (baseStyles, state) => ({
        ...baseStyles,      
        padding: "2px 4px",
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
        backgroundColor: state.isSelected ? "#0ea5e9" : state.isFocused ? "#f0f9ff" : "#fff",
    }),
    singleValue: (provided) => ({
        ...provided,
        fontSize: "14px",
        color: "#334155",
    }),
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"

const isArrayEqual = (a, b) => JSON.stringify(a.sort()) === JSON.stringify(b.sort())

export default function OrderForm(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false) 
    const { updatePageTitle } = usePageTitle();
    const params = useParams();

    const router = useRouter();
    const [formdata, setForm] = useState(initForm);    
    const [loadstate, setloadstate] = useState("")    
    const [saveState, setSaveState] = useState("")
    const [errorMessage, setErrorMessage] = useState("")        
    const [members, setMembers] = useState([])
	const [products, setProducts] = useState([])
    const [formdetails, setFormDetails] = useState(initDtls)
    const [origFormdata, setOrigFormdata] = useState(initForm)
    const [origDetails, setOrigDetails] = useState([])
	const [details, setDetails] = useState([])
    const [addShown, showAdd] = useState(false);    
    const [errLine, setErrorLine] = useState("")
    const [editShown, showEdit] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [showPostConfirm, setShowPostConfirm] = useState(false)
        
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
        const orderId = params?.id;
        
        if (orderId === 'add') {            
            updatePageTitle('Add Order');
        } else if (orderId && orderId !== 'add') {            
            updatePageTitle('Edit Order');
        }
              
    }, [params?.id, updatePageTitle]);

    useEffect(() => {

        if (formdata) {
            if (params.id) {
                if (!_.isEqual(formdata, origFormdata) || !isArrayEqual(details, origDetails)) {
                    setHasChanges(true)
                } else {
                    setHasChanges(false)
                }                
			}
        }

    }, [formdata])

    const init = async ()=>{
        // setloadstate("loading")     
        // setTimeout(() => {
        //     setloadstate("success")
        // }, 1000);
        setHasChanges(false)
        setloadstate("loading")     
        try{        
            const orderId = params?.id;         
                  
            const ret =  await callApi(`/order/${orderId}`, "GET") 
            if (ret.status==200){                                     
                setMembers(ret.data.members)
                setProducts(ret.data.products)
                if (ret.data.order){
                    setOrigFormdata(ret.data.order)
                    setForm(ret.data.order)
                    setDetails(ret.data.details)
                    setOrigDetails(ret.data.details)
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

    // console.log("formdata:", formdata)

    const handleSave = async ()=>{
      
        if (_.isEmpty(formdata.member_id)) {
            setErrorMessage("Please select a member.")
        } else if (_.isEmpty(details)) {
            setErrorMessage("Please add at least one product.")
        } else if (!formdata.bank_payment && !formdata.cash_payment && !formdata.cc_payment && !formdata.ewallet_payment) {
            setErrorMessage("Please select at least one payment  mode.")
        }else if (_.isEmpty(formdata.member_id?.city)) {
            setErrorMessage("Please complete member's address (city).")
        }else if (_.isEmpty(formdata.member_id?.province)) {
            setErrorMessage("Please complete member's address (province).")
        }else {
            
            let url = ""
            let data = {}
            data = { ...formdata,
                    details: details                
             }
            if (params?.id==='add'){                
                url = "/order/savenew"
            }else{               
                url = "/order/update"
            }
            setSaveState("saving")                     
            const ret =  await callApi(url, "POST", data) 
            if (ret.status==200){                
                setSaveState("success")                                    
                router.replace("/orders/"+ret.data)
                if (params?.id==='add'){                
                    toast.success('New order successfully saved!')                    
                }else{               
                    toast.success('Changes successfully saved!')
                }
                setTimeout(() => {
                    window.location.reload()    
                }, 1000);
                
                
            }else{              
                setSaveState("") 
                setErrorMessage(ret.name)
            }

            // setSaveState("saving") 
            // setTimeout(() => {
            //     setSaveState("success")
            //     toast.success('Order successfully saved!')
            // }, 2000);
        }
    }

    const handleCancel = async (e)=>{
        router.replace("/orders")
    }

    const handleChangeDate = (e)=>{
        setSaveState("")     
        setForm({ ...formdata, 
            transdate: e
        })
    }

    const handleChange = (e)=>{
        setSaveState("")       
        setErrorMessage("")
        setForm({ ...formdata, [e.target.name]: e.target.value })
    }

    const handleCheck = (e) => {       
        setSaveState("")       
        setErrorMessage("")
		var tmpO = Object.assign({}, formdata, {
			[e.target.name]: e.target.checked
		})
		setForm(tmpO)		
	}

    const handleRO = (e) => {       
        setSaveState("")       
        setErrorMessage("")
		var tmpO = Object.assign({}, formdata, {
			[e.target.name]: e.target.checked,
            hascodes: false
		})
		setForm(tmpO)	
    }


    const handlePC = (e) => {       
        setSaveState("")       
        setErrorMessage("")
		var tmpO = Object.assign({}, formdata, {
			[e.target.name]: e.target.checked,
            repeatorder: false
		})
		setForm(tmpO)
    }

    const handleChangeCat = (selectedOption)=>{
        setSaveState("")       
        setErrorMessage("")
        console.log("selectedOption:", selectedOption)
        let shipadd = (selectedOption.address1 || "") + ", " + (selectedOption.address2 || "") + " " + (selectedOption.city ? selectedOption.city.label + ", " : "") + (selectedOption.province ? selectedOption.province.label + " ": "") + (selectedOption.zip || "")
        setForm({ ...formdata, member_id: selectedOption, shipping_address: shipadd  })
    }


    const handleSelectProduct = (selected) => {

        var disc = handleCheckDiscount(formdata.member_id, selected)

        console.log("selected product:", selected)

        let tmpDetails ={...formdetails,
            product_id: selected,
            price: selected.price,
            discountedprice:  disc.subtotal,    
            discount:  disc.discount,
            subtotal: parseInt(formdetails.qty) * disc.subtotal,
            uom: selected.uom
        }
        setFormDetails(tmpDetails)
        setErrorMessage("")
        setErrorLine("")
    }

    const handleCheckDiscount = (member, p) => {

		var retV = {
			discount: 0,
			subtotal: 0
		}
		if (!_.isEmpty(p)) {
			retV.subtotal = p.price
			if (!_.isEmpty(member)) {
				if (member.isHub) {
					retV.discount = p.price - p.hub_price
					retV.subtotal = p.hub_price		
				} else {
					retV.discount = p.price - p.member_price
					retV.subtotal = p.member_price
				}
			}
		}
		return retV
	}

    const handleChangeDetails = (e) => {
		var disc = handleCheckDiscount(formdata.member_id, formdetails.product_id)
		var discount = formdetails.discount
		var subTotal = formdetails.subtotal
		if (e.target.value) {
			discount = parseInt(e.target.value) * parseFloat(disc.discount)
			subTotal = parseInt(e.target.value) * parseFloat(disc.subtotal)
		}
		var tmpO = {...formdetails, 
			qty: e.target.value,
			discountedprice: disc.subtotal,
			discount: discount,
			subtotal: subTotal
		}

		setFormDetails(tmpO)
		setErrorMessage("")
		setErrorLine("")
	}

    const handleCancelAdd = () =>{      
        showAdd(false)
		setFormDetails(initDtls)
		setErrorLine("")
    }

    
    function computeTotal(details) {

        var subTotal  = _.sumBy(details, function (o) { return parseFloat(o.subtotal)})
       
        var retVal = {
            subtotal: subTotal,            
            total: subTotal
        }
        return retVal
    }

    const handleAddItem = () =>{    
        if (_.isEmpty(formdetails.product_id)) {
			setErrorLine("Please select product.")
        } else if (formdetails.qty == 0) {
			setErrorLine("Please enter valid quantity.")
        }else{
            
            var indx = _.findIndex(details, function (e) {
				return e.product_id._id == formdetails.product_id._id
			})

            let newDetails = [...details]; // Create a copy of the array

            if (indx >= 0) {
				delete newDetails[indx].onDelete
				newDetails[indx] = Object.assign({}, newDetails[indx], {
					discount: formdetails.discount,
					discountedprice: formdetails.discountedprice,
					price: formdetails.price,
					qty: parseInt(formdetails.qty),
					subtotal: formdetails.subtotal,
					uom: formdetails.uom
				})
			} else {
				var new_data = Object.assign({}, formdetails, {
					_id: v4(),
					onInsert: true
				})
				newDetails.push(new_data)
			}
            
            // Update state with the new array
            setDetails(newDetails);            
            showAdd(false)
			setFormDetails(initDtls)
            var ttotal = computeTotal(newDetails) // Use the new array for calculation
            let tmpForm = {...formdata,
                subtotal: ttotal.subtotal,
                total_amount: ttotal.total
            }
            setForm(tmpForm)
            setErrorLine("")
            setErrorMessage("")
        }
    }

    const handleRemoveItem = (item) => {
        var indx = _.findIndex(details, function (e) {
			return item._id == e._id
		})

        if (indx >= 0) {
			if (details[indx].onInsert == 1) {
				details.splice(indx, 1)
			} else {
				details[indx] = Object.assign({}, details[indx], {
					onDelete: true
				})
			}
			setFormDetails(initDtls)
			var filtered_details = _.filter(details, function (o) { return !o.onDelete })

			var ttotal = computeTotal(filtered_details)

			var tmpO = Object.assign({}, formdata, {
				'subtotal': ttotal.subtotal,				
				'total_amount': ttotal.total,
			})
			setForm(tmpO)
            setErrorLine("")
            setErrorMessage("")
		}

    }

   
    const handleEdit = (item) => {
		var indx = _.findIndex(details, function (o) { return o._id == item._id })
		setFormDetails(details[indx])
		showEdit(true)
		showAdd(false)
	}

    const handleCancelEdit = () => {
		showEdit(false)
		setFormDetails(initDtls)
		setErrorLine("")
	}
    
    const handleUpdateItem = (item) => {

        if (_.isEmpty(formdetails.product_id)) {
			setErrorLine("Please select product.")
        } else if (formdetails.qty == 0) {
			setErrorLine("Please enter valid quantity.")
        }else{
            var indx = _.findIndex(details, function (o) { return o._id == item._id })
			details[indx] = Object.assign({}, details[indx], {
				...item,
				discount: item.discount,
				discountedprice: item.discountedprice,
				price: item.price,
				qty: parseInt(item.qty),
				subtotal: item.subtotal
			})
			showEdit(false)
			setFormDetails(initDtls)

			var ttotal = computeTotal(details)

			var tmpO = Object.assign({}, formdata, {
				'subtotal': ttotal.subtotal,				
				'total_amount': ttotal.total,
			})
			setForm(tmpO)
            setErrorLine("")
            setErrorMessage("")
        }
    }

    const handlePost = ()=>{
        setShowPostConfirm(true)
     
    }


    const handlePostConfirm = async ()=>{
        init()
        setShowPostConfirm(false)
        toast.success('Order successfully posted!')
    }

    let content = <PreLoader/>
 
   
    if (loadstate==="success"){
        content = ""
    }
    
    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 my-3">
                    <TriangleAlert className="h-5 w-5 text-red-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-red-700">{errorMessage}</span>
                </div>
    }

    var errorLineBox = null
    if (errLine){
        errorLineBox = <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 my-3">
                    <TriangleAlert className="h-5 w-5 text-red-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-red-700">{errLine}</span>
                </div>
	}

    let boxActivated = <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">--</span>
    let boxStockist = null

    let codebox = ""

    if (formdata.member_id){
        if (formdata.member_id.activated){
            boxActivated = <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Member</span>
        }else{
            boxActivated = <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">Non-Member</span>
        }

        if (formdata.member_id.isHub){
            const hubColors = { 0: 'bg-sky-100 text-sky-700', 1: 'bg-orange-100 text-orange-700', 2: 'bg-pink-100 text-pink-700' }
            boxStockist = <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${hubColors[formdata.member_id.hubtype] || 'bg-sky-100 text-sky-700'}`}>{HUBTYPE[formdata.member_id.hubtype || 0]}</span>

            codebox = <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:bg-slate-50 transition">
                        <Checkbox id="hascodes" name="hascodes" checked={formdata.hascodes} onChange={handlePC} disabled={formdata.status == 1} className="text-sky-600 focus:ring-sky-500"/>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Generate product codes</p>
                            <p className="text-xs text-slate-400">Auto-generate codes for hub products</p>
                        </div>
                    </label>
        }        
    }
    
    return (
        <div className='mt-4 px-2 pb-10 flex justify-center'>
            <div className="lg:container lg:max-w-7xl">
                {/* Header */}
                <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-sm">
                    <div className="absolute -right-24 -top-16 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl" />
                    <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-amber-100/70 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={handleCancel} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition">
                                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                                </button>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Order Management</p>
                                    <h1 className="mt-1 text-2xl font-semibold text-slate-800">
                                        {params?.id === 'add' ? 'New Order' : `Order #${formdata?.order_num ? pad(formdata.order_num, 6) : ''}`}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {formdata.status === 1 && (
                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                                        Posted
                                    </span>
                                )}
                                {formdata.status === 0 && params.id !== 'add' && (
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
                                        Open
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {errorBox}

                {loadstate !== "success" ? (
                    <div className="mt-6"><PreLoader /></div>
                ) : (
                    <>
                        {/* Row 1: Order Details (Order Info + Member + Shipping in one card) */}
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                                    <ClipboardList className="h-4 w-4 text-sky-600" />
                                </div>
                                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Order Details</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-4">
                            
                                <div className="lg:col-span-2">
                                    <label className={labelClass}>Member <span className="text-red-400">*</span></label>
                                    <Select menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={selectStyles} options={members} value={formdata.member_id} isDisabled={formdata.status == 1} onChange={handleChangeCat} />
                                </div>
                                <div>
                                    <label className={labelClass}>Date <span className="text-red-400">*</span></label>
                                    <input className={inputClass} id="transdate" value={moment(formdata.transdate).format("YYYY-MM-DD")} type="date" name="transdate" onChange={handleChange} disabled={formdata.status == 1} />
                                </div>
                                <div>
                                    <label className={labelClass}>Order #</label>
                                    <input className={inputClass} id="order_num" value={formdata?.order_num ? pad(formdata.order_num, 6) : "[AUTO]"} type="text" name="order_num" disabled />
                                </div>
                                <div>
                                    <label className={labelClass}>Account Status</label>
                                    <div className="mt-1 flex flex-wrap gap-1.5">{boxActivated}{boxStockist}</div>
                                </div>
                                <div>
                                    <label className={labelClass}>Sponsor</label>
                                    <p className="mt-1 text-sm text-slate-600 truncate">{formdata.member_id?.sponsorid?.fullname || "--"}</p>
                                </div>
                                <div className="lg:col-span-2">
                                    <label className={labelClass}>Shipping Address</label>
                                    <input className={inputClass} id="shipping_address" value={formdata.shipping_address} type="text" disabled />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className={labelClass}>Remarks</label>
                                    <textarea className={`${inputClass} min-h-[48px] resize-none`} id="remarks" value={formdata.remarks} name="remarks" disabled={formdata.status == 1} onChange={handleChange} rows={1} />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Payment + Options side by side */}
                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Payment Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Payment</h2>
                                </div>
                                <div>
                                    <label className={labelClass}>Payment Mode</label>
                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                        {[
                                            { id: "cash_payment", label: "Cash" },
                                            { id: "cc_payment", label: "Credit Card" },
                                            { id: "bank_payment", label: "Bank Transfer" },
                                            { id: "ewallet_payment", label: "E-Wallet" },
                                        ].map(pm => (
                                            <label key={pm.id} className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition ${formdata[pm.id] ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                                <Checkbox id={pm.id} name={pm.id} checked={formdata[pm.id]} onChange={handleCheck} disabled={formdata.status == 1} className="text-sky-600 focus:ring-sky-500" />
                                                <span className="text-sm font-medium text-slate-700">{pm.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className={labelClass}>Payment Reference</label>
                                    <input
                                        className={inputClass}
                                        id="payment_ref_num"
                                        value={formdata.payment_ref_num}
                                        type="text"
                                        name="payment_ref_num"
                                        onChange={handleChange}
                                        disabled={formdata.status == 1}
                                        placeholder="Enter reference number"
                                    />
                                </div>
                            </div>

                            {/* Options Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                        <Settings className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Options</h2>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:bg-slate-50 transition">
                                        <Checkbox id="repeatorder" name="repeatorder" checked={formdata.repeatorder} onChange={handleRO} disabled={formdata.status == 1} className="text-sky-600 focus:ring-sky-500" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Repeat Order</p>
                                            <p className="text-xs text-slate-400">Mark as a repeat purchase</p>
                                        </div>
                                    </label>
                                    {codebox}
                                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:bg-slate-50 transition">
                                        <Checkbox id="hasactivationcodes" name="hasactivationcodes" checked={formdata.hasactivationcodes} onChange={handleCheck} disabled={formdata.status == 1} className="text-sky-600 focus:ring-sky-500" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Generate activation codes</p>
                                            <p className="text-xs text-slate-400">For membership packages</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Order Items - Full Width */}
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                                        <ShoppingCart className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Order Items</h2>
                                </div>
                                {formdata.status != 1 && (
                                    <button type="button" onClick={() => showAdd(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition">
                                        <Plus className="h-3.5 w-3.5" /> Add Item
                                    </button>
                                )}
                            </div>
                            {errorLineBox}
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <Table striped>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeadCell className="w-[280px] text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Product</TableHeadCell>
                                            <TableHeadCell className="w-[120px] text-center text-xs uppercase tracking-wider text-slate-500 bg-slate-50">SRP</TableHeadCell>
                                            <TableHeadCell className="w-[60px] text-center text-xs uppercase tracking-wider text-slate-500 bg-slate-50">UOM</TableHeadCell>
                                            <TableHeadCell className="w-[120px] text-center text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Disc. Price</TableHeadCell>
                                            <TableHeadCell className="w-[80px] text-center text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Qty</TableHeadCell>
                                            <TableHeadCell className="w-[120px] text-center text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Sub Total</TableHeadCell>
                                            <TableHeadCell className="w-[80px] text-center text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Action</TableHeadCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {details.map((item, index) => {
                                            if (!item.onDelete) {
                                                return (
                                                    <EditForm key={index} data={item}
                                                        index={index}
                                                        details={details}
                                                        formdata={formdata}
                                                        products={products}
                                                        formdetails={formdetails}
                                                        addShown={addShown}
                                                        editShown={editShown}
                                                        errLine={errLine}
                                                        onSelectProduct={handleSelectProduct}
                                                        onChangeDetails={handleChangeDetails}
                                                        onRemoveItem={handleRemoveItem}
                                                        onEdit={handleEdit}
                                                        onCancelEdit={handleCancelEdit}
                                                        onUpdateItem={handleUpdateItem}
                                                    />
                                                )
                                            }
                                        })}
                                        {addShown && (
                                            <AddForm products={products}
                                                formdetails={formdetails}
                                                details={details}
                                                errLine={errLine}
                                                onAddItem={handleAddItem}
                                                onCancelAdd={handleCancelAdd}
                                                onSelectProduct={handleSelectProduct}
                                                onChangeDetails={handleChangeDetails}
                                            />
                                        )}
                                        <TableRow className="bg-slate-50">
                                            <TableCell colSpan={5} className="text-right text-sm font-bold text-slate-700">Total Amount:</TableCell>
                                            <TableCell className="text-center text-sm font-bold text-slate-800">{Number(formdata.total_amount.toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Row 4: Action Buttons - Back left, Save/Post right */}
                        <div className="mt-6 flex items-center justify-between">
                            <CancelBtn type="button" onClick={handleCancel}>Back to Orders</CancelBtn>
                            <div className="flex items-center gap-3">
                                {params.id !== 'add' && !hasChanges && formdata.status == 0 && (
                                    <button type="button" onClick={handlePost} className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition">
                                        Post Order
                                    </button>
                                )}
                                {formdata.status != 1 && (
                                    <PrimaryBtn type="button" onClick={handleSave} isLoading={saveState === "saving"}>
                                        {params?.id === 'add' ? 'Save Order' : 'Save Changes'}
                                    </PrimaryBtn>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <ConfirmPost
                    showPostConfirm={showPostConfirm}
                    setShowPostConfirm={setShowPostConfirm}
                    orderData={formdata}
                    onYes={handlePostConfirm}
                />
                <Toaster position="top-center" reverseOrder={false} />
            </div>
        </div>
    )
}

