"use client"
import React, { useEffect, useState} from 'react';
import logo from '../../assets/logo_200.png'
import Image from 'next/image';
import helping from '../../assets/helping.png'
import { interFont } from  '../main/layout'
import { useRouter } from "next/navigation";
import PrimaryBtn from '@/components/primaryBtn';
import { signIn, signOut, useSession } from "next-auth/react";
import { TriangleAlert } from "lucide-react";

const formData = {
    username: "",
    password: ""
}

export default function Login() {

    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    
    const [form, setForm] = useState(formData)
    const [errorMessage, setErrorMessage] = useState("")
    

    useEffect(() => {

        if (sessionStatus=="authenticated"){
             router.replace("/main");
        }

    },[sessionStatus])

   
    const handleChange = (e)=>{

        setErrorMessage("")
        let newF = { ...form, 
            [e.target.name]: e.target.value
        }
        setForm(newF)
    }
    
    
    const handleSubmit = async (e)=>{

        e.preventDefault();

        if (!form.username.trim()) {
            setErrorMessage("Please enter your username.");     
            return;
        }else if (!form.password.trim()) {
            setErrorMessage("Please enter your password.");     
            return;
        }

        const { username, password} = form

        const res = await signIn("credentials", {
            redirect: false,
            username,
            password            
        });     
        
        if (res?.error) {
            setErrorMessage("Invalid username or password");              
            if (res?.url) router.replace("/");
            } else {
              setErrorMessage("");                
        }
    }

    var errorBox = null
    if (errorMessage) {
        errorBox = <div className="flex gap-2 bg-[#e12d2dbf] p-2 my-4">
                    <TriangleAlert  className="h-6 w-6  text-white" strokeWidth={3} />
                    <span className="text-base font-bold text-white">{errorMessage}</span>
                </div>
                    
    }

    return (
        <div id="login" className={`${interFont.className} p-8 bg-[#7eb8e836] pb-20  text-[#404a60]`}>
            <div className="flex justify-start">
                <Image src={logo.src} alt="Logo" width={120} height={78}/>
            </div>
            <div className='flex justify-center w-full'>
                <div className='w-full md:w-[600px] bg-[#fff] rounded-xl mt-10 px-2 py-10 shadow-lg'>

                    <form onSubmit={handleSubmit}>
                        <div className='p-1'>                       
                            <div className='px-8 py-10'>
                                <div className='pb-6 space-y-2 ' >
                                    <h2 className={`text-3xl font-bold tracking-tight`}>
                                        Admin Portal
                                    </h2>
                                    <p className={`font-medium`}>Sign in to your account</p>
                                </div> 
                                {errorBox}
                                <div className='mt-6'>
                                    <label htmlFor="username" className="md:text-lg font-medium block mb-4">Enter Username</label>
                                    <input
                                        className="w-full text-sm border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Username" id="username" name="username" value={form.username} onChange={handleChange} type="text" maxLength={40}></input>
                                </div>           
                                <div className='mt-4'>
                                    <label htmlFor="pwd" className="md:text-lg font-medium block mb-4">Password</label>
                                    <div className="border border-[#dcdcdc] rounded-3xl px-3 md:px-6 py-2 md:py-3 mb-4 relative ">
                                        <input className="w-11/12 text-sm bg-transparent focus:outline-none" placeholder="Enter Your Password" id="password" name="password" maxLength={20} value={form.password} type="password" onChange={handleChange}/><span className="absolute ltr:right-5 rtl:left-5 top-1/2 cursor-pointer -translate-y-1/2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-eye-off "><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"></path><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"></path><path d="M3 3l18 18"></path></svg></span>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex gap-6">
                                    <PrimaryBtn type="submit">Login</PrimaryBtn>
                                </div>
                            </div>
                                                
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
