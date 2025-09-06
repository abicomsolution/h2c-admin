
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const citySchema = new Schema({    
    _id: { type: Schema.Types.ObjectId},
    label: { type: 'String'},      
    province: { type: 'String'},
    city: Number
}, {toJSON: { virtuals: true }});

citySchema.virtual('value').get(function(){
    return this._id;
})

export default mongoose.models.city || mongoose.model("city", citySchema);
