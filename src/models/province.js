
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const provinceSchema = new Schema({ 
    value: { type: 'String', default: "" },  
    label: { type: 'String', default: "" },      
    region: { type: 'String', default: "" }
});

export default mongoose.models.province || mongoose.model("province", provinceSchema);