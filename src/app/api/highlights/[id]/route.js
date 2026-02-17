import Highlights from "@/models/highlight";
import HighlightPhoto from "@/models/highlight_photo";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const GET = async (request, context) => {  
    
    const { params } = context;   
    const { id } = await params;

    try {   

        await connect();           

        let data = null

        if (id && id !== "new") {
            data = await Highlights.findById(id).populate('photos');
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}