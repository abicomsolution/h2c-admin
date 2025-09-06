
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const provinceSchema = new Schema({
    _id: { type: Schema.Types.ObjectId},
    value: { type: 'String'},
    label: { type: 'String'},      
    region: { type: 'String'}
});

export default mongoose.models.province || mongoose.model("province", provinceSchema);