
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const paymethodschema = new Schema({
    name: { type: 'String' },
    tpe: { type: Number, default: 0 },
    status: { type: Number, default: 0 }
}, { toJSON: { virtuals: true } });

paymethodschema.virtual('value').get(function () {
    return this._id;
})

paymethodschema.virtual('label').get(function () {
    return this.name;
})


export default mongoose.models.payment_method || mongoose.model("payment_method", paymethodschema);


// tpe
// 0 - GCash
// 1 - Bank