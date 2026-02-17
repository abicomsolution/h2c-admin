
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const highlightPhotoSchema = new Schema({   
    key: { type: String, default: "" },
    path: { type: String, default: "" },
    thumbnailkey: { type: String, default: "" },
    thumbnailurl: { type: String, default: "" },    
}, {toJSON: { virtuals: true }});

export default mongoose.models.highlight_photo || mongoose.model("highlight_photo", highlightPhotoSchema);