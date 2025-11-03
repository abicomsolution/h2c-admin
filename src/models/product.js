import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
    category_id: { type: Schema.Types.ObjectId, ref: 'product_category' },
    code: { type: 'String', default: "" },
    productname: { type: 'String', default: "" },    
    description: { type: 'String', default: "" },
    benefits: { type: 'String', default: "" }, 
    uom: { type: 'String', default: "" },
    price: { type: 'String', default: "" },
    weight: { type: Number, default: 0 },
    member_price: { type: Number, default: 0 },    
    hub_price: { type: Number, default: 0 },
    hub_profit: { type: Number, default: 0 },
    h2c_wallet: { type: 'String', default: "" },
    stairstep_alloc: { type: 'String', default: "" },
    unilevel_alloc: { type: Number, default: 0 },    
    photo_thumb: { type: 'String', default: "" },
    isMembership: { type: Boolean, default: true },
    isProdPackage: { type: Boolean, default: false },    
    isActive: { type: Boolean, default: true },    
    unit_cost: { type: Number, default: 0 },
    min_stock_level: { type: Number, default: 0 },
    isNonInventory: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false }, 
}, { toJSON: { virtuals: true } });

productSchema.virtual('value').get(function () {
    return this._id;
})

productSchema.virtual('label').get(function () {
    return this.productname;
})

export default mongoose.models.product || mongoose.model("product", productSchema);