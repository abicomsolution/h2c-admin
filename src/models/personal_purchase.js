
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const personalpurchaseSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    nmonth: { type: Number, default: 0 },
    nyear: { type: Number, default: 0 },
    personalsales: { type: Number, default: 0 },
    groupsales: { type: Number, default: 0 },   
    duedate: { type: Date, default: null },
    pv: { type: Number, default: 0 },
    requiredpv: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    ispaid: { type: Number, default: 0 }
});

export default mongoose.models.personal_purchase || mongoose.model("personal_purchase", personalpurchaseSchema);

