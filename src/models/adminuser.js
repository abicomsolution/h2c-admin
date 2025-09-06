import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const adminUserSchema = new Schema({
    username: { type: 'String' },
    pwd: { type: 'String' },
    plain_pwd: { type: 'String' },
    fullname: { type: 'String' },
    emailadd: { type: 'String' },
    status: { type: Number, default: 0 }           
});

export default mongoose.models.adminuser || mongoose.model("adminuser", adminUserSchema);