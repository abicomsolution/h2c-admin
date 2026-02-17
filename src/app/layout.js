import {  Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { SidebarProvider } from '@/context/SidebarContext';
import SessionProvider from "@/provider/SessionProvider"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import "./globals.css";
import "./main.css"
import "./genealogy.css"
import 'react-responsive-modal/styles.css';

export const metadata = {
  title: "Helping Hands Community - Admin",
  description: "Helping Hands Community",
};


export const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"], // optional
});


export default async function RootLayout({ children }) {

  const session =  await getServerSession(authOptions)

  return (
    <html lang="en">
      <body
        className={`${interFont.variable} antialiased`}
      >
        <SessionProvider session={JSON.stringify(session)}>    
            <SidebarProvider>{children}</SidebarProvider>        
        </SessionProvider>        
        
      </body>
    </html>
  );
}
