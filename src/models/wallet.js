
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    accumulated : { type: Number, default: 0 },
    withdrawal : { type: Number, default: 0 },
    pending : { type: Number, default: 0 },
    balance : { type: Number, default: 0 }    
});

export default mongoose.models.wallet || mongoose.model("wallet", walletSchema);
