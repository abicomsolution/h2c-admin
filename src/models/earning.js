
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const earningSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },    
    direct: { type: Number, default: 0 },
    indirect: { type: Number, default: 0 },
    ctp: { type: Number, default: 0 },    
    transferred: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
    net_balance: { type: Number, default: 0 },  
    balance: { type: Number, default: 0 }    
});

export default mongoose.models.earning || mongoose.model("earning", earningSchema);

