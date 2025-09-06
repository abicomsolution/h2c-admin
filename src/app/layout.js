import { Geist, Geist_Mono, Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import SessionProvider from "@/provider/SessionProvider"
import "./globals.css";
import "./main.css"

export const metadata = {
  title: "Helping Hands Community - Admin",
  description: "Helping Hands Community",
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"], // optional
});


export default async function RootLayout({ children }) {

  const session = await getServerSession();

  return (
    <html lang="en">
      <body
        className={`${interFont.variable} antialiased`}
      >
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
        
      </body>
    </html>
  );
}
