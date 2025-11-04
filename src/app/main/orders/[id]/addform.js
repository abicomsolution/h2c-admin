import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Check, X } from 'lucide-react';

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

export default function AddForm(props) {

    const [filteredProducts, setFilteredProducts] = useState([])
    const { products, formdetails, details, onSelectProduct, onChangeDetails, onCancelAdd, onAddItem } = props

    useEffect(()=>{
        
        const filtered_details = details.filter(o => !o.onDelete)
        const details_ids = filtered_details.map(o=>{return o.product_id._id})
        const filtered_products = products.filter(o => !details_ids.includes(o._id))
        setFilteredProducts(filtered_products)

    },[products, details])

    const handleSelectProd = (selectedOption) => {
        onSelectProduct(selectedOption)
    }

    const handleChange = (e) =>{
        onChangeDetails(e)
    }

    const handleCancelAdd = () =>{
        onCancelAdd()
    }

    const handleAddItem = () =>{
        onAddItem()
    }

    return (
        <>
        <TableRow>
            <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white px-4">
                 <Select menuPortalTarget={typeof document !== "undefined" ? document.body : null} styles={controlStyle}  options={filteredProducts} value={formdetails.product_id} onChange={handleSelectProd}/>
            </TableCell>
            <TableCell className='text-center'>
                <p>{Number(formdetails.price).toLocaleString('en', {minimumFractionDigits: 2})}</p>
            </TableCell>
            <TableCell className='text-center'>
                <p>{formdetails.uom}</p>
            </TableCell>
             <TableCell className='text-center'>
                <p>{Number(formdetails.discountedprice).toLocaleString('en', {minimumFractionDigits: 2})}</p>
            </TableCell>
            <TableCell className='text-center'>                                  
                <input
                    className="w-full text-sm placeholder-gray-500 border border-[#dcdcdc] rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 focus:ring-blue-500 focus:border-transparent"
                    placeholder=""   value={formdetails.qty} type="number" name='qty' onChange={handleChange}/>
               
            </TableCell>
            <TableCell className='text-center'>
                <p>{Number(formdetails.subtotal).toLocaleString('en', {minimumFractionDigits: 2})}</p>
            </TableCell>
            <TableCell>
                <div className='flex justify-center'>
                    <div className='flex gap-2'>
                        <div>
                            <button type="button" onClick={handleCancelAdd} className="bg-[#cc262644] hover:bg-[#cc262670] text-red-700 py-2 px-2 rounded-full text-sm">
                                <X className='h-6 w-6'/>
                            </button>
                        </div>
                        <div>
                            <button type="button" onClick={handleAddItem} className="bg-[#26cc2e44] hover:bg-[#26cc2e73] text-green-700 py-2 px-2 rounded-full text-sm">
                                <Check className='h-6 w-6'/>
                            </button>
                        </div>
                    </div>
                </div>

            </TableCell>
        </TableRow>        
        </>
    )

}