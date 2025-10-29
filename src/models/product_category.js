
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productCategorySchema = new Schema({
    name:  { type: 'String'},
    description:  { type: 'String'},
    status: Number,
}, {toJSON: { virtuals: true }});

productCategorySchema.virtual('value').get(function(){
    return this._id;
})

productCategorySchema.virtual('label').get(function(){
    return this.name;
})

export default mongoose.models.product_category || mongoose.model("product_category", productCategorySchema);

