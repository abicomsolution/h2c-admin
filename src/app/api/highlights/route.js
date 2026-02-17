
import Highlights from "@/models/highlight";
import HighlightPhoto from "@/models/highlight_photo";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const GET = async (request, context) => {  
  
    await connect();           

    try {   

        let data = await Highlights.find().populate('photos').sort({ transdate: -1 });
                     
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
      console.log(err)
        return new NextResponse(err, {
        status: 500,
      });
    }

}