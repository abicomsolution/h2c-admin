"use client"
import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo_200.png'
import Image from 'next/image';
import helping from '../../assets/helping.png'
import { useRouter } from "next/navigation";
import PrimaryBtn from '@/components/primaryBtn';
import { signIn, useSession } from "next-auth/react";
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
             router.replace("/");
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
        errorBox = (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 my-5">
                <TriangleAlert className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-red-700">{errorMessage}</span>
            </div>
        )
                    
    }

    return (
        <div id="login" className={` relative overflow-hidden text-[#1e2430]`}>
            <div className="login-blob login-blob-a" aria-hidden="true" />
            <div className="login-blob login-blob-b" aria-hidden="true" />

            <div className="relative z-10 mx-auto max-w-3xl px-6 py-10 md:py-14">
                <div className="flex items-center gap-3">
                    <Image src={logo.src} alt="Logo" width={120} height={78} />
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold tracking-wide text-slate-700">H2C Administration</p>
                        <p className="text-xs text-slate-500">Secure access for company administrators</p>
                    </div>
                </div>

                <div className="mt-8 grid items-stretch gap-8">
                    <div className="login-card login-fade mx-auto w-full max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-7 md:px-9 md:py-9">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Admin Portal</p>
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                                    <p className="text-sm text-slate-600">Sign in to continue.</p>
                                </div>

                                {errorBox}

                                <div className="mt-5">
                                    <label htmlFor="username" className="text-sm font-semibold text-slate-700">Username</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100"
                                        placeholder="Enter your username"
                                        id="username"
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        type="text"
                                        maxLength={40}
                                    />
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100"
                                        placeholder="Enter your password"
                                        id="password"
                                        name="password"
                                        maxLength={20}
                                        value={form.password}
                                        type="password"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                                        Keep me signed in
                                    </label>
                                 
                                </div>

                                <div className="mt-6">
                                    <PrimaryBtn type="submit">Sign in</PrimaryBtn>
                                </div>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
