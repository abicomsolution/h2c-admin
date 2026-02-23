
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const codeSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    sender_id: { type: Schema.Types.ObjectId, ref: 'member' },
    date_created: { type: Date, default: null },
    time_created: { type: Date, default: null },
    datetime_sent: { type: Date, default: null },
    datetime_used: { type: Date, default: null },
    codenum: { type: 'String' },
    status: { type: Number, default: 0 },
    isCD: { type: Boolean, default: false },
    order_id: { type: Schema.Types.ObjectId, ref: 'order_header' },
    codetype: { type: Number, default: 0 },   
}, { toJSON: { virtuals: true } });

codeSchema.virtual('value').get(function () {
    return this._id;
})

codeSchema.virtual('label').get(function () {    
    return this.codenum;
})

export default mongoose.models.code || mongoose.model("code", codeSchema);

// codetype
// 0 - BR
// Dragnet or Binary Packages
// 1 - Jumpstart
// 2 - Basic
// 3 - Pro
// 4 - Elite

