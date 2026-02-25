
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
    isCD: { type: Boolean, default: false },
    status: { type: Number, default: 0 },
    codetype: { type: Number, default: 0 },   
    order_id: { type: Schema.Types.ObjectId, ref: 'order_header' },
}, { toJSON: { virtuals: true } });

codeSchema.virtual('value').get(function () {
    return this._id;
})

codeSchema.virtual('label').get(function () {    
    var retS = ""
    if (this.codetype == 0) {
        retS = this.codenum + " - H2C 1.0";   
    } else if (this.codetype == 1) {
        retS = this.codenum + " - BR";   
    } else if (this.codetype == 2) {
        retS = this.codenum + " - Jumpstart";   
    } else if (this.codetype == 3) {
        retS = this.codenum + " - Basic";   
    } else if (this.codetype == 4) {
        retS = this.codenum + " - Pro";   
    } else if (this.codetype == 5) {
        retS = this.codenum + " - Elite";   
    }

    if (this.isCD) {
        retS = retS + " (CD)";   
    }
    return retS;
})

export default mongoose.models.code || mongoose.model("code", codeSchema);


// codetype
// 0 - H2C 1.0
// 1 - BR
// 2 - Jumpstart
// 3 - Basic
// 4 - Pro
// 5 - Elite


