
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const munilevelSchema = new Schema({
    parent_id: { type: Schema.Types.ObjectId, ref: 'member' },
    child_id: { type: Schema.Types.ObjectId, ref: 'member' },
    level: Number
});


export default mongoose.models.munilevel || mongoose.model("munilevel", munilevelSchema);