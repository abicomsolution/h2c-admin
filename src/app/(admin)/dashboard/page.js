
import React from 'react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Ui from './ui'
import PreLoader from '@/components/preloader';


export default async function Page() {

    const session = await getServerSession(authOptions)
    
    if (!session) {
        redirect("/login") // or your custom /login
    }

    const user = session.user;    

  return (
     <Suspense fallback={<PreLoader />}>
         <Ui user={JSON.stringify(user)}/>   
     </Suspense>   
  );
}
