
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const binaryTransSchema = new Schema({
    earning_id: { type: Schema.Types.ObjectId, ref: 'binary_earning', default: null },    
    transdate: { type: Date, default: null },
    earning_type: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    net_amount: { type: Number, default: 0 },
    binary_id: { type: Schema.Types.ObjectId, ref: 'binary', default: null },
    account_id: { type: Schema.Types.ObjectId, ref: 'binary', default: null },
    trans_type: { type: Number, default: 0 },
    remarks: { type: 'String', default: "" },
    position: { type: String, default: "" },
    hasdd: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    from_member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null },    
});

export default mongoose.models.binary_trans || mongoose.model("binary_trans", binaryTransSchema);


// earning_type
// *************************
// 0 - wallet
// 1 - direct
// 2 - double direct
// 3 - sales match
// 4 - performance
// 5 - stairstep
// 6 - breakaway
// 10 - wallet withdrawal
// 11 - direct withdrawal
// 12 - double direct withdrawal
// 13 - sales match withdrawal
// 14 - performance withdrawal
// 15 - stairstep withdrawal
// 16 - breakaway withdrawal

