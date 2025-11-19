
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const monthlyUDetailSchema = new Schema({      
    monthly_unilevel_id: { type: Schema.Types.ObjectId, ref: 'monthly_unilevel' },    
    transdate: { type: Date, default: null },
    order_id: { type: Schema.Types.ObjectId, ref: 'order_header' },      
    purchase_id: { type: Schema.Types.ObjectId, ref: 'purchase' },      
    points: { type: Number, default: 0},
    level: { type: Number, default: 0},    
    transtype: { type: Number, default: 0}   
});

export default mongoose.models.monthly_unilevel_detail || mongoose.model("monthly_unilevel_detail", monthlyUDetailSchema);

