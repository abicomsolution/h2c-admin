
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const generalSchema = new Schema({   
    minimum_withdrawal: { type: Number, default: 0 },    
    admin_fee: { type: Number, default: 0 },
    is_admin_fee_percent: { type: Boolean, default: false },
    tax: { type: Number, default: 0 },
    is_tax_percent: { type: Boolean, default: false },
    payout_sched: { type: Number, default: 0 },
    disable_payout: { type: Boolean, default: false }
});

export default mongoose.models.general || mongoose.model("general", generalSchema);

