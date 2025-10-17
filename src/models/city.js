
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const citySchema = new Schema({      
    label: { type: 'String', default: "" },  
    province: { type: 'String', default: "" },
    city: { type: Number, default: 0 }
}, {toJSON: { virtuals: true }});

citySchema.virtual('value').get(function(){
    return this._id;
})

export default mongoose.models.city || mongoose.model("city", citySchema);
