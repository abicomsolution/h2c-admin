import Member from "@/models/member";
import Munilevel from "@/models/munilevel";
import { NextResponse } from "next/server";
import connect from "@/utils/db";

export const POST = async (request) => {
       
    var body =  await request.json();

    try {       

        await connect()    

        await transfer(body.id)
      
        return NextResponse.json({}, { status: 200 });           

     } catch (err) {
        console.log(err)
        var _err = { name: err};          
        return NextResponse.json(_err, { status: 500 });
    }
   
}


const transfer = async (id) => {

    async function getMemberInfo (mid) {      
        const retVv = await Member.findById(mid).populate('sponsorid')         
        return retVv                             
    }

    async function saveMUnilevel(params) {              
        var data = {
            parent_id: params.parent_id,
            child_id: params.child_id,
            level: params.level
        }      
        var newMUnilevel = Munilevel(data);
        await newMUnilevel.save()    
    }

    var memberRes= await getMemberInfo(id)

    if (memberRes){
        var counter = {
            parent_id: memberRes.sponsorid._id,
            child_id: id,
            member: memberRes.sponsorid,
            level: 1,            
            currentsponsor: memberRes.sponsorid,
            prevSponsor: null
        }
        while(counter.parent_id !=null){
                    
            await saveMUnilevel(counter)           

            const nextParent = await getMemberInfo(counter.parent_id)

            if (nextParent){
                counter.parent_id = nextParent.sponsorid?nextParent.sponsorid._id : null
                counter.member = nextParent.sponsorid
                counter.level += 1                
            }else{
                counter.parent_id = null
            }
        }          
    }   

}