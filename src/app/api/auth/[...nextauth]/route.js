import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import Adminuser from "@/models/adminuser";
import connect from "@/utils/db";
import _ from 'lodash'
import bcrypt from "bcryptjs";

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
      CredentialsProvider({
        id: "credentials",
        name: "Credentials",
        credentials: {         
          username: { label: "username", type: "text" },
          password: { label: "Password", type: "password" },        
        },
        async authorize(credentials) {

      
          await connect();

          try {          
            var uname= '^' + credentials.username + '$';
            let user = await Adminuser.findOne({ username: { $regex: new RegExp(uname, "i") }})            
          
            if (user) {
              
                let isPasswordCorrect = await bcrypt.compare(
                      credentials.password,
                      user.pwd
                    );                      
                if (isPasswordCorrect) {                
                    const retU = {
                        id: user._id,
                        username: user.username,
                        email: user?.emailadd,
                        fullname: user.fullname,
                        status: user.status
                    }                
                    return retU;
                }
            }
          } catch (err) {
            throw new Error(err);
          }
        },
      }),
      GithubProvider({
        clientId: process.env.GITHUB_ID ?? "",
        clientSecret: process.env.GITHUB_SECRET ?? "",
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID ?? "",
        clientSecret: process.env.GOOGLE_SECRET ?? "",
      }),
      // ...add more providers here
    ],      
      session: {
      strategy: "jwt", // Or "database" if using a session database
    },
    
    //  domain: "admin.lvh.me",   
    cookies: {
         sessionToken: {
          name: `admin.session-token`,
          options: {
            // domain: "corporate.h2ccorp.ph",
            domain: "admin.lvh.me", 
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          },
        },
        // csrfToken: { 
        //   name: "admin.csrf-token",  
        //   options: { 
        //     sameSite: "lax", 
        //     path: "/", 
        //     secure: process.env.NODE_ENV==="production" 
        //   } 
        // },
    },
    callbacks: {
      async signIn({ user, account }) {        
        if (account?.provider == "credentials") {          
          return user;
        }
        if (account?.provider == "github") {
            return true;
        
        }  
        if(account?.provider == "google"){
            return true;       
        }  
      },
      async jwt({ token, user, account }) {        
        return token
      },
      async session({ session, user, token }) {       
        try {         
          await connect();
          const userT = await Adminuser.findById(token.sub)
        
          
          if (userT){             
              session.user.id = userT._id
              session.user.status = userT.status
              session.user.email  = userT.emailadd
              session.user.fullname = userT.fullname                 
              return (session)
          }else {
            return session
          }
        } catch (err) {
            console.log(err)
            return session
        }
      },
    }

  };
  
  export const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };