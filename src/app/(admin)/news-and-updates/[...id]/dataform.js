import UIForm from "./uiform"
import callApi from '@/utils/api-caller';


async function initData (id) {  
    try {       
        const response = await callApi(`/highlights/${id}`);           
        return response.data || null;
    } catch (error) {
        console.error('Error fetching setup:', error);
        return null;
    }
}

export default async function DataForm({id}) {

    const data = await initData(id);  

    return <UIForm data={data}/>;
}