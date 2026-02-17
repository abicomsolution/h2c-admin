
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const highlightSchema = new Schema({
	transdate: {type: Date, default: null},	
	headline: { type: 'String', default: '' },
	content: { type: 'String', default: '' },	
	ctype: { type: Number, default: 0 },
	photos: {
      type: [{ type: Schema.Types.ObjectId, ref: "highlight_photo" }],
      default: [],
	},
	videourl: { type: 'String', default: '' },	  
}, {toJSON: { virtuals: true }});


export default mongoose.models.highlight || mongoose.model("highlight", highlightSchema);
