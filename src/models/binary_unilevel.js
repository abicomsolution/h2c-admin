
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const binaryUnilevelSchema = new Schema({
    transdate: { type: Date, default: null },
    parent_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    child_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    level: { type: Number, default: 0 },            
    position_on_parent: { type: "String", default: "" }
});

export default mongoose.models.binary_unilevel || mongoose.model("binary_unilevel", binaryUnilevelSchema);