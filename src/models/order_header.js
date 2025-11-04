import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderHeaderSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    transdate:  { type: Date, default: null},
    order_num:  { type: Number, default: 0},
    cash_payment: { type: Boolean, default: false},
    bank_payment: { type: Boolean, default: false},
    cc_payment: { type: Boolean, default: false},
    ewallet_payment: { type: Boolean, default: false},  
    status: { type: Number, default: 0},
    payment_ref_num:  { type: 'String', default: ''},
    repeatorder: { type: Number, default: 0},
    hascodes: { type: Number, default: 0},
    hasactivationcodes: { type: Number, default: 0},
    last_modified_id: { type: Schema.Types.ObjectId, ref: 'adminUser' },
    trans_type: { type: Number, default: 0},   
    subtotal: { type: Number, default: 0},   
    total_amount: { type: Number, default: 0},
    // shippind address
    shipping_address: { type: String, default: ""},   
    remarks: { type: String, default: ""},      
}, {toJSON: { virtuals: true }});


export default mongoose.models.order_header || mongoose.model("order_header", orderHeaderSchema);

//status
// 0 - Open
// 1 - Posted

//trans_type
// 0 - Manual
// 1 - Online

// online_order_tpe
// 0 - Guest
// 1 - Registered
// 2 - Distributor

// order_status
// 0 - On Process
// 1 - For Pickup
// 2 - Rider in Transit
// 3 - Delivered
// 4 - Cancelled
// 5 - Returned
// 6 - Picked Up
// 7 - Failed to deliver

// payment_type
// 0 - Cash on delivery
// 1 - Ewallet
// 2 - Bank
// 3 - Remittance
// 4 - Shopping Points