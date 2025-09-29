
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const earningSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },    
    topup: { type: Number, default: 0 },
    direct: { type: Number, default: 0 },
    ctp: { type: Number, default: 0 },    
    royalty: { type: Number, default: 0 }, 
    unilevel: { type: Number, default: 0 }, 

    direct_transferred: { type: Number, default: 0 },
    direct_balance: { type: Number, default: 0 },
  
    ctp_transferred: { type: Number, default: 0 },
    ctp_balance: { type: Number, default: 0 },

    royalty_transferred: { type: Number, default: 0 },
    royalty_balance: { type: Number, default: 0 },

    unilevel_transferred: { type: Number, default: 0 },
    unilevel_balance: { type: Number, default: 0 },

    indirect_lvl_1: { type: Number, default: 0 },
    indirect_lvl_1_paid: { type: Number, default: 0 },    
    
    indirect_lvl_2: { type: Number, default: 0 },
    indirect_lvl_2_paid: { type: Number, default: 0 },    

    indirect_lvl_3: { type: Number, default: 0 },
    indirect_lvl_3_paid: { type: Number, default: 0 },    

    indirect_lvl_4: { type: Number, default: 0 },
    indirect_lvl_4_paid: { type: Number, default: 0 },    

    indirect_lvl_5: { type: Number, default: 0 },
    indirect_lvl_5_paid: { type: Number, default: 0 },    

    indirect_lvl_6: { type: Number, default: 0 },
    indirect_lvl_6_paid: { type: Number, default: 0 },    
    
    indirect_lvl_7: { type: Number, default: 0 },
    indirect_lvl_7_paid: { type: Number, default: 0 },    

    indirect_lvl_8: { type: Number, default: 0 },
    indirect_lvl_8_paid: { type: Number, default: 0 },    

    indirect_lvl_9: { type: Number, default: 0 },
    indirect_lvl_9_paid: { type: Number, default: 0 },    

    indirect_lvl_10: { type: Number, default: 0 },
    indirect_lvl_10_paid: { type: Number, default: 0 },    
    
    indirect: { type: Number, default: 0 },
    indirect_available: { type: Number, default: 0 },
    indirect_transferred: { type: Number, default: 0 },
    indirect_balance: { type: Number, default: 0 },


    transferred: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
    net_balance: { type: Number, default: 0 },  
    balance: { type: Number, default: 0 }    
});

export default mongoose.models.earning || mongoose.model("earning", earningSchema);

