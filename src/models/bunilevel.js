
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const bunilevelSchema = new Schema({
    parent_id: { type: Schema.Types.ObjectId, ref: 'member' },
    child_id: { type: Schema.Types.ObjectId, ref: 'member' },
    level: Number
});


export default mongoose.models.bunilevel || mongoose.model("bunilevel", bunilevelSchema);