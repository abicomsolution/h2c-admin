
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const earningTransSchema = new Schema({
    earning_id: { type: Schema.Types.ObjectId, ref: 'earning', default: null },
    transdate: { type: Date, default: null },
    earning_type: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    net_amount: { type: Number, default: 0 },    
    trans_type: { type: Number, default: 0 },
    remarks: { type: 'String', default: "" },
    level: { type: Number, default: 0 },
    from_member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null }    
});

export default mongoose.models.earning_transaction || mongoose.model("earning_transaction", earningTransSchema);

// earning_type
// 0 - H2C Wallet
// 1 - Direct referral
// 2 - Indirect referral
// 3 - CTP
// 4 - unilevel
// 5 - royalty

// 6 - transfer direct
// 7 - transfer indirect
// 8 - transfer ctp
// 9 - transfer unilevel
// 10 - transfer royalty

// 11 - Transferred
