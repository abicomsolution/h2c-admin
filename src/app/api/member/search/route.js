import Member from "@/models/member";
import { NextResponse } from "next/server";
import connect from "@/utils/db";


export const POST = async (request) => {

    var body =  await request.json();

    await connect();    

    try {   

        let fields = {
            $or: [
                { username: { $regex: new RegExp(body.search, "i") } },
                { fname: { $regex: new RegExp(body.search, "i") } },
                { lname: { $regex: new RegExp(body.search, "i") } },
                { mname: { $regex: new RegExp(body.search, "i") } },
                { emailadd: { $regex: new RegExp(body.search, "i") } }
            ]
        }

        let data = await Member.find(fields).populate("sponsorid", "fullname username")
        
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}