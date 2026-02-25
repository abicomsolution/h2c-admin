
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const binaryEarningSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    wallet: { type: Number, default: 0 },
    wallet_withdrawn: { type: Number, default: 0 },
    wallet_balance: { type: Number, default: 0 },

    direct: { type: Number, default: 0 },
    direct_withdrawn: { type: Number, default: 0 },
    direct_balance: { type: Number, default: 0 },

    doubledirect: { type: Number, default: 0 },
    doubledirect_withdrawn: { type: Number, default: 0 },
    doubledirect_balance: { type: Number, default: 0 },

    salesmatch: { type: Number, default: 0 },
    salesmatch_withdrawn: { type: Number, default: 0 },
    salesmatch_balance: { type: Number, default: 0 },
    
    performance: { type: Number, default: 0 },
    performance_withdrawn: { type: Number, default: 0 },
    performance_balance: { type: Number, default: 0 },

    stairstep: { type: Number, default: 0 },
    stairstep_withdrawn: { type: Number, default: 0 },
    stairstep_balance: { type: Number, default: 0 },

    breakaway: { type: Number, default: 0 },
    breakaway_withdrawn: { type: Number, default: 0 },
    breakaway_balance: { type: Number, default: 0 },
    
    accumulated: { type: Number, default: 0 },    
    withdrawal: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }    
});

export default mongoose.models.binary_earning || mongoose.model("binary_earning", binaryEarningSchema);
