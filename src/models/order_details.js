
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderDetailsSchema = new Schema({
    order_header_id: { type: Schema.Types.ObjectId, ref: 'order_header' },
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    price: { type: Number, default: 0 },
    discountedprice: { type: Number, default: 0},
    qty: { type: Number, default: 0},
    discount: { type: Number, default: 0},
    subtotal: { type: Number, default: 0},    
    isProdPackage: { type: Boolean, default: false},
    uom: { type: 'String', default: '' },
    //fields from online order
    product_name: { type: 'String', default: '' },
    photo: { type: 'String', default: '' }
});

export default mongoose.models.order_detail || mongoose.model("order_detail", orderDetailsSchema);