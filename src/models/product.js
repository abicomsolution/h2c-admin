import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
    category_id: { type: Schema.Types.ObjectId, ref: 'product_category' },
    code: { type: 'String', default: "" },
    productname: { type: 'String', default: "" },
    points: { type: Number, default: 0 },
    uom: { type: 'String', default: "" },
    price: { type: 'String', default: "" },
    value_pack_price: { type: Number, default: 0 },
    premium_pack_price: { type: Number, default: 0 },
    bc_price: { type: Number, default: 0 },
    stockist_price: { type: Number, default: 0 },
    cv_points: { type: Number, default: 0 },
    description: { type: 'String', default: "" },
    benefits: { type: 'String', default: "" },
    level1: { type: Number, default: 0 },
    level2: { type: Number, default: 0 },
    level3: { type: Number, default: 0 },
    level4: { type: Number, default: 0 },
    level5: { type: Number, default: 0 },
    level6: { type: Number, default: 0 },
    level7: { type: Number, default: 0 },
    level8: { type: Number, default: 0 },
    level9: { type: Number, default: 0 },
    level10: { type: Number, default: 0 },
    level11: { type: Number, default: 0 },
    level12: { type: Number, default: 0 },
    bv: { type: Number, default: 0 },
    sv: { type: Number, default: 0 },
    photo_thumb: { type: 'String', default: "" },
    isProdPackage: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    packageType: { type: Number, default: 0 },
    unit_cost: { type: Number, default: 0 },
    max_stock_level: { type: Number, default: 0 },
    isNonInventory: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    photos: { type: Array, default: [] },
    isSpec: { type: Boolean, default: false }
}, { toJSON: { virtuals: true } });

productSchema.virtual('value').get(function () {
    return this._id;
})

productSchema.virtual('label').get(function () {
    return this.productname;
})

export default mongoose.models.product || mongoose.model("product", productSchema);