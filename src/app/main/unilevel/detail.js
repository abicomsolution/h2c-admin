
import { useState, useEffect, use } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter, Checkbox, Label } from "flowbite-react";
import CancelBtn from '@/components/cancelBtn'
import DataTable from 'react-data-table-component';
import NoRecord from '@/components/NoRecord';
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import moment from 'moment';

function Detail(props) {

    const { showDetail, setshowDetail,  interFont, selectedMember} = props        
    const [details, setDetails] = useState([]);
    const [loadstate, setLoadstate] = useState("");
   
    useEffect(() => {

        if (showDetail && selectedMember) {
           fetchDetails(selectedMember._id)
        }

    }, [showDetail, selectedMember])
  
    const handleClose = () => {        
        setshowDetail(false)
    }


    const fetchDetails = async (id) => {
        setLoadstate("loading")
        try {
            let body = {id: id}
            let res = await callApi('/unilevel/details', 'POST', body)
            if (res.status === 200) {
                setDetails(res.data)
                setLoadstate("success")
            }else{
                setLoadstate("error")
            }
        } catch (error) {
            console.log(error)
            setLoadstate("error")
        }
        // setTimeout(() => {
        //     setLoadstate("success")
        // }, 2000);
        
    }
   
    console.log(details)

    let content = <PreLoader/>


    const columns = [
       	{
            name: 'Date',           
            sortable: true,
            width: "150px",
            selector: row=>moment(row.purchase_id.transdate).format("MMM-DD h:mm A").toUpperCase()
        },   
          {
            name: 'Level',        
            sortable: true,
            center: true,
            width: "100px",       
            selector: row=>row.level            
        },
        {
            name: 'Member',            
            sortable: true,            
            selector: row=>row.purchase_id.member_id.fullname,
            width: "300px",
        },
        {
            name: 'Product',            
            sortable: true,           
            selector: row=>row.purchase_id.productname
        },   
        {
            name: 'Qty',         
            sortable: true,
            width: "80px",
            selector: row=>row.purchase_id.qty
        },           
        {
            name: 'Total amount',			
            right: 'true',			
            sortable: true,
            width: "160px",
            selector: row => <p className="mb-0">{Number(row.purchase_id.subtotal || 0).toLocaleString('en', {minimumFractionDigits: 2})}</p>
        },         
        {
            name: 'Unilevel',			
            right: 'true',			
            sortable: true,
            selector: row => <p className="mb-0">{Number(row.points || 0).toLocaleString('en', {minimumFractionDigits: 2})}</p>
        },           
       
    ]


    if (loadstate==="success"){
        content =   <DataTable
                        noHeader
                        pagination
                        columns={columns}
                        data={details}
                        noDataComponent={<NoRecord/>}
                        customStyles={customStyles}
                    />
    }

    return(
        <Modal show={showDetail}  onClose={handleClose} size='6xl' className={`${interFont.className}`} >            
            <ModalBody>              
                <ModalHeader className='border-b-gray-200 pl-0'>Details - <label className='text-base'>{selectedMember ? selectedMember.member_id.fullname : ''}</label></ModalHeader>

                <div className="flex justify-center items-center">
                    <div className="max-h-[600px] overflow-y-auto w-full">
                        {content}

                    </div>
                </div>            

              
            
            </ModalBody>              
      </Modal>
    )

}


export default Detail;





const customStyles = {
    rows: {
        style: {
            fontSize: "15px",            
            // minHeight: '50px',
            color: "#404a60",  
            paddingTop: '14px',  
            paddingBottom: '14px',              
            opacity: 0.9,
             '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: "#e5e7ebad"
            },
            overflow: "visible !important"
        }
    },
    headRow: {
        style: {
            borderBottomColor: "#e5e7eb"
        }
    },
    headCells: {
        style: {
            fontSize: "15px",
            fontWeight: "800",
            paddingTop: '14px',  
            paddingBottom: '14px',  
            backgroundColor: "#4371e90d",
            color: "#404a60"           
        }
    },
    cells: {
        style: {
            padding: '0px 14px',            
            backgroundColor: "#fff"          
        },
     
    },
    pagination: {
        style: {
            backgroundColor: "#fff",
          

        },
        pageButtonsStyle: {
            fill: "#fff"
        }
    },
    noData: {
        style: {
            backgroundColor: "#fff",
            color: "#fff"
        }
    }
};