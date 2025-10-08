
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const memberBeneficiarySchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    otype: { type: Number, default: 0 },
    beneficiary_relationship: { type: String, default: "" },
    beneficiary_fname: { type: String, default: "" },
    beneficiary_mname: { type: String, default: "" },
    beneficiary_lname: { type: String, default: "" },    
    beneficiary_contact_no: { type: String, default: "" },
    beneficiary_birthdate: { type: Date, default: null },
    beneficiary_address1: { type: String, default: "" },
    beneficiary_address2: { type: String, default: "" },
    beneficiary_province: { type: Schema.Types.ObjectId, ref: 'province' },
    beneficiary_city: { type: Schema.Types.ObjectId, ref: 'city' },
    beneficiary_zipcode: { type: String, default: "" }  
}, { toJSON: { virtuals: true } });


export default mongoose.models.member_beneficiary || mongoose.model('member_beneficiary', memberBeneficiarySchema);


// periodFrom: { type: Date, default: null },
// periodTo: { type: Date, default: null },
// policyno: { type: String, default: "" }

