
"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PrimaryBtn from "@/components/primaryBtn";
import callApi from "@/utils/api-caller";
import { TUSER, RANKS, GEN_HEADER } from '@/utils/constants';
import PreLoader from '@/components/preloader';
import UserPic from '../../../assets/no_photo.png'
import _ from 'lodash'
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';


const initData = {
    lv1: [],
    lv2: [],
    lv3: [],
    lv4: [],
    lv5: []    
}

function truncateString(str, maxLength, addEllipsis = true) {
  if (typeof str !== "string") {
    throw new Error("Input must be a string");
  }

  if (str.length <= maxLength) {
    return str;
  }

  return addEllipsis
    ? str.slice(0, maxLength) + "..."
    : str.slice(0, maxLength);
}


export default function Genealogy(props) {

    const session = useSession()
    const router = useRouter();    
    const [loadstate, setloadstate] = useState("")
    const [initialized, setinitialized] = useState(false) 
    const [errorMessage, setErrorMessage] = useState("")    
    const [userdata, setuserdata] = useState(TUSER)
    const [header, setheader] = useState(GEN_HEADER);
    const [data, setdata] = useState(initData);
    const [nav, setnav] = useState([]);


    useEffect(() => {
    
        if (session.status=="authenticated"){                 
            setinitialized(true)                
        }
    
    }, [session])


     useEffect(() => {
        
        if (initialized){        
            init("68bbcda70b12e0477ccb75df")   
        }
        
    }, [initialized])


    const init = async (id)=>{

        setloadstate("loading")     

        try{                       
            let params = { id: id, status: 0}
            const ret =  await callApi("/genealogy", "POST", params) 
            if (ret.status==200){                
                setheader(ret.data.header)
                setdata(ret.data.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }        
    }

     const handleView = (id)=>{
        let tnav = nav
        tnav.push(id)
        setnav(tnav)
        init(id)
    }

    const handleGenBack = ()=>{
      
        if (nav.length==0){
              init("68bbcda70b12e0477ccb75df")   
        }else{
            let tnav = nav
            tnav.splice(tnav.length-1, 1);
            setnav(tnav)
            if (nav.length==0){
                init("68bbcda70b12e0477ccb75df")     
            }else{
                var id = tnav[tnav.length-1]
                init(id)
            }
        }
    }


    const handleTop = ()=>{
        setnav([])
        init("68bbcda70b12e0477ccb75df")   
    }

    let content = <PreLoader/>

    if (loadstate==="success"){     
        
        let subcontent = data.lv1.map((e, index)=>{
            return (
               <div className = "parent" key = {index}>
                    <div className = "bt"/>
                    <div className = "vbtop"/>
                    <div className = "details">
                         <div className='flex justify-center'>
                            <div className='rounded-xl bg-white shadow-md p-2 max-w-[130px] min-w-[120px]'>
                                <button onClick={()=>handleView(e.child_id._id)}>
                                    <img className='image-container' src={e.child_id.photo_thumb?e.child_id.photo_thumb: UserPic}/>
                                    <p className = "name truncate">{truncateString(e.child_id.fname + " " + e.child_id.lname, 13, true)}</p>      
                                    <div className='flex justify-center'>
                                        <div className='flex'>
                                            <p className = "username">{e.child_id.username}</p>
                                            {e.child_id.isCd && <div className='w-2 h-2 mt-1 rounded-full bg-red-500'/>}
                                        </div>
                                    </div>    
                                    <label className ={`rank ${e.child_id.rank==4?'bg-[#9933ff]':e.child_id.rank==3?'bg-[#ff4488]':e.child_id.rank==2?'bg-[#ff9900]':e.child_id.rank==1?'bg-[#d7a202]':e.child_id.rank==0?'bg-[#339933]':""}`}>
                                        {RANKS[e.child_id.rank].label}
                                    </label>                              
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className = { _.findIndex(data.lv2, function(o) { return o.parent_id == e.child_id._id; }) >=0 ? "vbbottom" : ""}/>
                    <div className = "child">
                        {
                            data.lv2.map((i, index2)=>{
                                if(e.child_id._id == i.parent_id){
                                    return(
                                        <div className = "parent" key = {index2}>
                                            <div className = "bt"/>
                                            <div className = "vbtop"/>
                                            <div className = "details">
                                                 <div className='flex justify-center'>
                                                    <div className='rounded-xl bg-white shadow-md p-2'>
                                                        <button onClick={()=>handleView(i.child_id._id)}>
                                                            <img className='image-container' src={i.child_id.photo_thumb?i.child_id.photo_thumb: UserPic}/>
                                                            <p className = "name truncate">{truncateString(i.child_id.fname + " " + i.child_id.lname, 13, true)}</p>      
                                                            <div className='flex justify-center'>
                                                                <div className='flex'>
                                                                    <p className = "username">{i.child_id.username}</p>
                                                                    {i.child_id.isCd && <div className='w-2 h-2 mt-1 rounded-full bg-red-500'/>}
                                                                </div>
                                                            </div>    
                                                            <label className ={`rank ${i.child_id.rank==4?'bg-[#9933ff]':i.child_id.rank==3?'bg-[#ff4488]':i.child_id.rank==2?'bg-[#ff9900]':i.child_id.rank==1?'bg-[#d7a202]':i.child_id.rank==0?'bg-[#339933]':""}`}>
                                                                {RANKS[i.child_id.rank].label}
                                                            </label>                              
                     
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className = { (_.findIndex(data.lv3, function(o) { return o.parent_id == i.child_id._id; })) >=0 ? "vbbottom" : ""}/>
                                            <div className = "child">
                                                {
                                                    data.lv3.map((el, index3)=>{
                                                        if(i.child_id._id == el.parent_id){
                                                            return(	
                                                                 <div className = "parent" key = {index3}>
                                                                    <div className = "bt"/>
                                                                    <div className = "vbtop"/>
                                                                    <div className = "details">
                                                                         <div className='flex justify-center'>
                                                                            <div className='rounded-xl bg-white shadow-md p-2'>
                                                                                <button onClick={()=>handleView(el.child_id._id)}>
                                                                                    <img className='image-container' src={el.child_id.photo_thumb?el.child_id.photo_thumb: UserPic}/>
                                                                                    <p className = "name truncate">{truncateString(el.child_id.fname + " " + el.child_id.lname, 13, true)}</p>      
                                                                                    <div className='flex justify-center'>
                                                                                        <div className='flex'>
                                                                                            <p className = "username">{el.child_id.username}</p>
                                                                                            {el.child_id.isCd && <div className='w-2 h-2 mt-1 rounded-full bg-red-500'/>}
                                                                                        </div>
                                                                                    </div>    
                                                                                    <label className ={`rank ${el.child_id.rank==4?'bg-[#9933ff]':el.child_id.rank==3?'bg-[#ff4488]':el.child_id.rank==2?'bg-[#ff9900]':el.child_id.rank==1?'bg-[#d7a202]':el.child_id.rank==0?'bg-[#339933]':""}`}>
                                                                                        {RANKS[el.child_id.rank].label}
                                                                                    </label>                          
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className = { (_.findIndex(data.lv4, function(o) { return o.parent_id == el.child_id._id; })) >=0 ? "vbbottom" : ""}/>
                                                                    <div className = "child">
                                                                        {
                                                                            data.lv4.map((e4, index4)=>{
                                                                                if(el.child_id._id == e4.parent_id){
                                                                                    return(	
                                                                                        <div className = "parent" key = {index4}>
                                                                                            <div className = "bt"/>
                                                                                            <div className = "vbtop"/>
                                                                                            <div className = "details">
                                                                                                <div className='flex justify-center'>
                                                                                                    <div className='rounded-xl bg-white shadow-md p-2'>
                                                                                                        <button onClick={()=>handleView(e4.child_id._id)}>
                                                                                                            <img className='image-container' src={e4.child_id.photo_thumb?e4.child_id.photo_thumb: UserPic}/>
                                                                                                            <p className = "name truncate">{truncateString(e4.child_id.fname + " " + e4.child_id.lname, 13, true)}</p>      
                                                                                                            <div className='flex justify-center'>
                                                                                                                <div className='flex'>
                                                                                                                    <p className = "username">{e4.child_id.username}</p>
                                                                                                                    {e4.child_id.isCd && <div className='w-2 h-2 mt-1 rounded-full bg-red-500'/>}
                                                                                                                </div>
                                                                                                            </div>                        
                                                                                                            <label className ={`rank ${e4.child_id.rank==4?'bg-[#9933ff]':e4.child_id.rank==3?'bg-[#ff4488]':e4.child_id.rank==2?'bg-[#ff9900]':e4.child_id.rank==1?'bg-[#d7a202]':e4.child_id.rank==0?'bg-[#339933]':""}`}>
                                                                                                                {RANKS[e4.child_id.rank].label}
                                                                                                            </label>   
                                                                                                        </button>
                                                                                                    </div>  
                                                                                                </div>                                                                                               
                                                                                            </div>
                                                                                            <div className = { (_.findIndex(data.lv5, function(o) { return o.parent_id == e4.child_id._id; })) >=0 ? "vbbottom" : ""}/>
                                                                                            <div className = "child">
                                                                                                {
                                                                                                    data.lv5.map((e5, index5)=>{
                                                                                                        if(e4.child_id._id == e5.parent_id){
                                                                                                            return(	
                                                                                                                <div className = "parent" key = {index5}>
                                                                                                                    <div className = "bt"/>
                                                                                                                    <div className = "vbtop"/>
                                                                                                                    <div className = "details">
                                                                                                                        <div className='flex justify-center'>
                                                                                                                            <div className='rounded-xl bg-white shadow-md p-2'>
                                                                                                                                <button onClick={()=>handleView(e5.child_id._id)}>
                                                                                                                                    <img className='image-container' src={e5.child_id.photo_thumb?e5.child_id.photo_thumb: UserPic}/>
                                                                                                                                    <p className = "name truncate">{truncateString(e5.child_id.fname + " " + e5.child_id.lname, 13, true)}</p>      
                                                                                                                                    <div className='flex justify-center'>
                                                                                                                                        <div className='flex'>
                                                                                                                                            <p className = "username">{e5.child_id.username}</p>
                                                                                                                                            {e5.child_id.isCd && <div className='w-2 h-2 mt-1 rounded-full bg-red-500'/>}
                                                                                                                                        </div>
                                                                                                                                    </div>    
                                                                                                                                    <label className ={`rank ${e5.child_id.rank==4?'bg-[#9933ff]':e5.child_id.rank==3?'bg-[#ff4488]':e5.child_id.rank==2?'bg-[#ff9900]':e5.child_id.rank==1?'bg-[#d7a202]':e5.child_id.rank==0?'bg-[#339933]':""}`}>
                                                                                                                                        {RANKS[e5.child_id.rank].label}
                                                                                                                                    </label>                               
                                                                                                                                </button>
                                                                                                                            </div>
                                                                                                                        </div>        
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            )
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            </div>            
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                            })
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div> 
               </div>
            )
        })

     
        content =  <div  className='graphical mt-4 relative pb-10 max-w-[400px] lg:max-w-[1500px] md:max-w-[1000px]'>
                        <div style = {{width:'fit-content',margin:'auto'}}>
                            <div className = "parent mt-4">
                                <div className = "details">  
                                    <div className='flex justify-center'>
                                        <div className='rounded-xl bg-white shadow-md p-2 max-w-[160px] min-w-[160px]'>
                                            <img className='image-container' src={header.photo_thumb?header.photo_thumb: UserPic}/>
                                            <p className = "name truncate">{header.fname} {header.lname}</p>        
                                            <div className='flex justify-center'>
                                                <div className='flex'>
                                                    <p className = "username">{header.username}</p>
                                                    {header.isCd && <div className='w-2 h-2 mt-1 rounded-full bg-red-500'/>}
                                                </div>
                                            </div>        
                                            <label className ={`rank ${header.rank==4?'bg-[#9933ff]':header.rank==3?'bg-[#ff4488]':header.rank==2?'bg-[#ff9900]':header.rank==1?'bg-[#d7a202]':header.rank==0?'bg-[#339933]':""}`}>
                                                {RANKS[header.rank].label}
                                            </label>      
                                        </div>                                                                         
                                    </div>                               
                                </div> 

                                <div className = {data.lv1.length > 0 ? "vbbottom" : ""}/>
                                <div className = "child">
                                    {subcontent}
                                </div>        
                            </div>               
                        </div>    
                    </div> 
        // content = <div className='bg-white rounded-xl  p-6'><NoRecord/></div>                          
    }

    var btnNav = null
    var btnprev = null
    

    if (nav.length>0){
        btnprev = <button className='p-2 bg-white rounded-full shadow-sm' onClick={()=>handleGenBack()}>
                        <ArrowLeft className='h-6 w-6 text-[#3cadd2c2]'/>
                    </button>
        btnNav = <div className='flex gap-4'>
                    <button className='p-2 bg-white rounded-full shadow-sm' onClick={()=>handleTop()}>
                        <ArrowUp className='h-6 w-6 text-[#3cadd2c2]'/>
                    </button>
                    {btnprev}               
                </div>
    }


    return (
          <div id="genealogy" className={`w-full px-6`}>           
            <div className='flex justify-between mt-2'>               
                {btnNav}
            </div>
            {content}                               
        </div>
    )
}