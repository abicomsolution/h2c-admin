
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const WalletTransSchema = new Schema({
    wallet_id: { type: Schema.Types.ObjectId, ref: 'wallet' },
    transdate: { type: Date, default: null },
    trans_type: Number,
    income_type: Number,
    amount: Number    
});

export default mongoose.models.wallet_transaction || mongoose.model("wallet_transaction", WalletTransSchema);

// trans_type
// 0 - transfer
// 1 - withdrawal | encashment

// income_type
// 0 - H2C Wallet
// 1 - Direct referral
// 2 - Indirect referral
// 3 - CTP
// 4 - unilevel
// 5 - royalty