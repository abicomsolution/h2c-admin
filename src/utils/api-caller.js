
export const API_URL = "/api"


export default async function callApi(endpoint, method, body){
    

    try {
        const res = await fetch(`${API_URL}/${endpoint}`, {
            headers: { 'content-type': 'application/json'},
            method: method,            
            cache: "no-store",
            body: JSON.stringify(body),
        });                
        const ret1 = await res.json()          
        if (res.status === 200) {       
           return({ status: res.status, data: ret1, message: "Success" });
        }else{                             
            return({ status: res.status, message: ret1.name });
        }        
    } catch (error) {
        return({ status: 500, message: error.name });
    }

}   