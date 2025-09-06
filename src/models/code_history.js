
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const codeHistorySchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'member' },
    code_id: { type: Schema.Types.ObjectId, ref: 'code' },
    date_sent: { type: Date, default: null },
    time_sent: { type: Date, default: null },
    batch_id: { type: 'String' }

});

export default mongoose.models.code_history || mongoose.model("code_history", codeHistorySchema);

