"use client"
import DataTable from 'react-data-table-component';
import React, { useEffect, useState} from 'react';
import { Search } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePageTitle } from "@/provider/PageTitleProvider";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import { interFont } from '../../layout'
import moment from 'moment';
import { TriangleAlert, ArrowLeft, Plus } from "lucide-react";
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
                router.replace("/main/orders/"+ret.data)
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
        router.replace("/main/orders")
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
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-2">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                   
    }

    var errorLineBox = null
    if (errLine){
        errorLineBox = <div className="flex gap-2 bg-[#e12d2d47] p-3 my-4 rounded-lg px-6">
                    <TriangleAlert  className="h-6 w-6 text-red-600" strokeWidth={3} />
                    <span className="text-base font-bold text-red-600">{errLine}</span>
                </div>
	}

    // console.log("formdata:", formdata)
  
    let boxActivated = <p>--</p>
    let boxStockist= <p>--</p>

    let codebox = ""

    if (formdata.member_id){
        if (formdata.member_id.activated){
            // if (formdata.member_id.is)
            boxActivated =  <p className='bg-green-500 uppercase text-sm rounded-full px-4 font-bold text-white py-1'>Member</p>
        }else{
            boxActivated =  <p className='bg-gray-500 uppercase text-sm rounded-full px-4 font-bold text-white py-1'>Non-Member/Pre signup</p>
        }

        if (formdata.member_id.isHub){
            boxStockist =   <p className={`text-center ${formdata.member_id.hubtype == 2 ? 'bg-[#ff44ab]':formdata.member_id.hubtype == 1 ? 'bg-[#ff7044]' : formdata.member_id.hubtype == 0 ? 'bg-[#4469ff]': ""} uppercase text-sm rounded-full px-4 font-bold text-white py-1`}>{HUBTYPE[formdata.member_id.hubtype || 0]}</p>

            codebox = <div>
                        <Checkbox id="hascodes" name="hascodes" checked={formdata.hascodes} onChange={handlePC} disabled={formdata.status == 1}/>
                        <Label htmlFor="hascodes" className="ml-3 text-base font-medium -mt-1">Generate product codes</Label>
                    </div>
        }        
    }
    
    return (
        <div className={`${interFont.className} w-full px-6 pb-10`}>                    
            <div className="bg-white rounded-xl p-6 px-12 ">
                {errorBox}
                <div className="flex justify-between items-center mb-6 pt-2">
                    <div></div>
                    <div>
                        {formdata.status===1 && <p className='bg-green-400 p-2 px-4 rounded-4xl text-white'>Posted</p>}
                    </div>
                </div>
                <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-12'>
                    <div className='space-y-6'>
                        <div className='grid grid-cols-2 gap-4'>
                             <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Date <span className='text-red-500 text-xs'>*</span> </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3  focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="" id="transdate" 
                                    value={moment(formdata.transdate).format("YYYY-MM-DD")} 
                                    type="date" 
                                    name='transdate' 
                                    onChange={handleChange}
                                    disabled={formdata.status == 1}/>
                            </div>
                            <div>
                                <label className="md:text-lg font-medium block text-[#404758] mb-2">Order # </label>
                                <input
                                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Order Number" 
                                    id="order_num" 
                                    value={formdata?.order_num ? pad(formdata.order_num, 6): "[AUTO]"} 
                                    type="text" 
                                    name='order_num' disabled/>
                            </div>                           
                        </div>   
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-4">Payment Mode</label>
                            <div className='flex gap-6'>
                                <div>
                                    <Checkbox id="cash_payment" name="cash_payment" checked={formdata.cash_payment} onChange={handleCheck} disabled={formdata.status == 1}/>
                                    <Label htmlFor="cash_payment" className="ml-3 text-base font-medium -mt-1">Cash</Label>
                                </div>                              
                                <div>
                                    <Checkbox id="cc_payment" name="cc_payment" checked={formdata.cc_payment} onChange={handleCheck} disabled={formdata.status == 1}/>
                                    <Label htmlFor="cc_payment" className="ml-3 text-base font-medium -mt-1">Credit Card</Label>
                                </div>
                                <div>
                                    <Checkbox id="bank_payment" name="bank_payment" checked={formdata.bank_payment} onChange={handleCheck} disabled={formdata.status == 1}/>
                                    <Label htmlFor="bank_payment" className="ml-3 text-base font-medium -mt-1">Bank Deposit/Transfer</Label>
                                </div>
                                <div>
                                    <Checkbox id="ewallet_payment" name="ewallet_payment" checked={formdata.ewallet_payment} onChange={handleCheck} disabled={formdata.status == 1}/>
                                    <Label htmlFor="ewallet_payment" className="ml-3 text-base font-medium -mt-1">E-Wallet</Label>
                                </div>
                            </div>
                        </div>  
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Payment Reference <span className='text-red-500 text-xs'>*</span> </label>
                            <input
                                className="w-100 text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="payment_ref_num" 
                                value={formdata.payment_ref_num} 
                                type="text" 
                                name='payment_ref_num'
                                onChange={handleChange}
                                disabled={formdata.status == 1}/>
                        </div>  
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Remarks </label>
                            <textarea
                                className="w-full h-16 text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" 
                                id="remarks" 
                                value={formdata.remarks} 
                                type="text" 
                                name='remarks' 
                                disabled={formdata.status == 1}
                                onChange={handleChange}/>                                
                        </div>

                        <div className='space-y-5'>
                            <div>
                                <Checkbox id="repeatorder" name="repeatorder" checked={formdata.repeatorder} onChange={handleRO} disabled={formdata.status == 1}/>
                                <Label htmlFor="repeatorder" className="ml-3 text-base font-medium -mt-1">Repeat Order</Label>
                            </div>
                            {codebox}
                            <div>
                                <Checkbox id="hasactivationcodes" name="hasactivationcodes" checked={formdata.hasactivationcodes} onChange={handleCheck} disabled={formdata.status == 1}/>
                                <Label htmlFor="hasactivationcodes" className="ml-3 text-base font-medium -mt-1">Generate activation codes (for packages)</Label>
                            </div>
                        </div>   
                    </div>
                    <div className='space-y-6'>
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Choose Member <span className='text-red-500 text-xs'>*</span> </label>
                            <Select  menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle}
                                     options={members} 
                                     value={formdata.member_id}   
                                     isDisabled={formdata.status == 1}
                                     onChange={handleChangeCat} />                            
                        </div>
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Account Status </label>
                            <div className='flex gap-4'>
                               {boxActivated}
                               {boxStockist}
                            </div>
                         </div>
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Shipping Address </label>
                            <textarea
                                className="w-full h-16 text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                placeholder="" id="shipping_address" value={formdata.shipping_address} type="text" disabled/>                                
                        </div>
                        <div>
                            <label className="md:text-lg font-medium block text-[#404758] mb-2">Sponsor</label>
                             <input
                                className="w-100 text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                                placeholder=""   value={formdata.member_id?.sponsorid?.fullname || "--"} type="text"  disabled/>                            
                        </div>
                    </div>
                </div>
                <div className='mt-8'>
                    <div className='flex justify-between'>
                        <p className='font-bold text-lg'>Products</p>
                        {formdata.status != 1 &&  <PrimaryBtn type="button" onClick={()=>showAdd(true)}> <Plus className='h-6 w-6'/>Add Product</PrimaryBtn> }
                    </div>  
                    
                    <div className="mt-2 overflow-x-auto">                      
                        {errorLineBox}                       
                        <Table striped>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell className='w-[300px]'>Product</TableHeadCell>
                                    <TableHeadCell className='w-[150px] text-center'>SRP</TableHeadCell>
                                    <TableHeadCell className='w-[60px] text-center'>UOM</TableHeadCell>
                                    <TableHeadCell className='w-[150px] text-center'>Discounted Price</TableHeadCell>
                                    <TableHeadCell className='w-[100px] text-center'>Quantity</TableHeadCell>
                                    <TableHeadCell className='w-[150px] text-center'>Sub Total</TableHeadCell>
                                    <TableHeadCell className='w-[100px] text-center'>Action</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    details.map((item, index) => {
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
                                    })
                                }
                               {
                                addShown &&
                                    <AddForm products={products} 
                                            formdetails={formdetails}
                                            details={details}      
                                            errLine={errLine}       
                                            onAddItem={handleAddItem}        
                                            onCancelAdd={handleCancelAdd}                        
                                            onSelectProduct={handleSelectProduct} 
                                            onChangeDetails={handleChangeDetails}/>
                               }
                              <TableRow>
                                <TableCell colSpan={5} className="text-right font-bold">Total Amount:</TableCell>
                                <TableCell className="text-center font-bold">{Number(formdata.total_amount.toFixed(2)).toLocaleString('en', {minimumFractionDigits: 2})}</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
                 <div className="border-b border-dotted border-gray-300 py-2">                        
                </div>
                <div className='py-4 flex justify-between'>
                    <CancelBtn type="button"  onClick={handleCancel}>Back</CancelBtn>     
                    <div className='flex gap-4'>
                        {
                            params.id!=='add' && !hasChanges && formdata.status==0 &&
                            <PrimaryBtn type="button" onClick={handlePost}>Post</PrimaryBtn>      
                        }
                        { formdata.status != 1 && <PrimaryBtn type="button"  onClick={handleSave}  isLoading={saveState==="saving"}>Save Changes</PrimaryBtn>}
                    </div>
                </div>
            </div>                  
            <ConfirmPost 
                showPostConfirm={showPostConfirm} 
                setShowPostConfirm={setShowPostConfirm} 
                orderData={formdata}
                onYes={handlePostConfirm}
                />
            <Toaster position="top-center" reverseOrder={false}/>
        </div>
    )
}

