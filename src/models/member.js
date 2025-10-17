
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    username: { type: 'String', default: '' },
    pwd: { type: 'String', default: '' },
    plain_pwd: { type: 'String', default: '' },
    fullname: { type: 'String', default: '' },
    fname: { type: 'String', default: '' },
    lname: { type: 'String', default: '' },
    mname: { type: 'String', default: '' },
    gender: { type: Number, default: 0 },
    birthdate: { type: Date, default: null },
    emailadd: { type: 'String', default: '' },
    referral_code: { type: "String", default: "" },
    userid: { type: 'String', default: '' },    
    sponsorid: { type: Schema.Types.ObjectId, ref: 'member' },
    photo_thumb: { type: 'String', default: '' },    
    account_type: { type: Number, default: 0 },
    activated: { type: Boolean, default: false },
    date_signup: { type: Date, default: null },
    date_time_activated: { type: Date, default: null },    
    mobile1: { type: 'String', default: '' },
    mobile2: { type: 'String', default: '' },
    address1: { type: 'String', default: '' },
    address2: { type: 'String', default: '' },
    province: { type: Schema.Types.ObjectId, ref: 'province', default: null },
    city: { type: Schema.Types.ObjectId, ref: 'city',  default: null },
    zipcode: { type: 'String', default: '' },            
    rank: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    paymethod: { type: Schema.Types.ObjectId, ref: 'payment_method' },    
    accountno: { type: 'String' },
    accountname: { type: 'String' },
    pmcontactno: { type: 'String' },
    isCd: { type: Boolean, default: false },
    cdPaid: { type: Boolean, default: false },        
    isPILock: { type: Boolean, default: false },       
    isAddLock: { type: Boolean, default: false },       
    isPayLock: { type: Boolean, default: false },    
    usertype: { type: Number, default: 0 },   
    isHub: { type: Boolean, default: false },
    hubtype: { type: Number, default: 0 },
    isUpgraded: { type: Boolean, default: false },
    date_upgraded: { type: Date, default: null },
    hub_province: { type: Schema.Types.ObjectId, ref: 'province', default: null },    
    hub_city: { type: Schema.Types.ObjectId, ref: 'city',  default: null }
}, { toJSON: { virtuals: true } });

memberSchema.virtual('value').get(function () {
    return this._id;
})
memberSchema.virtual('label').get(function () {
    return this.fname + ' ' + this.lname;
})

export default mongoose.models.member || mongoose.model("member", memberSchema);

//hubtype
// 1 - Municipal Hub
// 2 - City Hub

// rank
// 0 - Member
// 1 - Supervisor
// 2 - Manager
// 3 - Director
// 4 - Ambassador