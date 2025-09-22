
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const wRequestSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    transdate: { type: Date, default: null },
    amount: { type: Number, default: 0 },    
    paymethod: { type: Schema.Types.ObjectId, ref: 'payment_method' },    
    bankname:  { type: 'String', default: '' },
    accountno:  { type: 'String', default: '' },
    accountname: { type: 'String', default: '' },
    contactno: { type: 'String', default: '' },
    tax: { type: Number, default: 0 },
    adminfee: { type: Number, default: 0 },
    net: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    process_date: { type: Date, default: null },
});


export default mongoose.models.wrequest || mongoose.model("wrequest", wRequestSchema);

// status
// 0 - pending
// 1 - approved
// 2 - cancelled
// 3 - rejected