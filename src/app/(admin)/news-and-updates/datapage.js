import List from './list';

import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


export default async function DataPage() {

    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login") // or your custom /login
    }    

    return <List />;
}