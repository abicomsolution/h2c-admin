
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productCodeSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    sender_id: { type: Schema.Types.ObjectId, ref: 'member' },
    datetime_sent: { type: Date, default: null },
    codenum: { type: 'String', default: '' },  
    date_created: { type: Date, default: null },
    time_created: { type: Date, default: null },
    datetime_used: { type: Date, default: null },
    activated_by: { type: Schema.Types.ObjectId, ref: 'member' },
    expiry_date: { type: Date, default: null },
    order_id: { type: Schema.Types.ObjectId, ref: 'order_header' },
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    productname: { type: 'String', default: '' },
    price: { type: 'String', default: '' },
    discountedprice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    status: { type: Number, default: 0 }
}, { toJSON: { virtuals: true } });

productCodeSchema.virtual('value').get(function () {
    return this._id;
})

productCodeSchema.virtual('label').get(function () {
    return this.codenum + " - " + this.productname;
})


export default mongoose.models.product_code || mongoose.model("product_code", productCodeSchema);