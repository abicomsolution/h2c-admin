
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const monthlyUnilevelSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    nmonth: { type: Number, default: 0 },
    nyear: { type: Number, default: 0 },
    personalsales: { type: Number, default: 0 },
    groupsales: { type: Number, default: 0 },   
    unilevel: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    ispaid: { type: Number, default: 0 }
});

export default mongoose.models.monthly_unilevel || mongoose.model("monthly_unilevel", monthlyUnilevelSchema);

