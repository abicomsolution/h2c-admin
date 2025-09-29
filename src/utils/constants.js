export const RANKS = [
    { label: "Member", color: "#339933", maxlevel: 0 },
    { label: "Supervisor", color: "#ffcc33", maxlevel: 4 },
    { label: "Manager", color: "#ff9900", maxlevel: 6 },
    { label: "Director", color: "#ff4488", maxlevel: 8 },
    { label: "Ambassador", color: "#9933ff", maxlevel: 10  }
]

export const H2C_TOPUP = 300
export const DIRECT_REFERRAL = 500
export const STAIRSTEP_ALLOC = 100

export const INDIRECT_REFERRAL = [ 500, 200, 100, 50, 50, 30, 20, 20, 20, 10 ]
export const STAIRSTEP_RANK = [ 20, 30, 40, 50 ]
export const ROYALTY_RANK = [ 50, 20, 10, 10, 10 ]

export const GEN_HEADER = {  
    fullname: "",
    username: "",
    fname: "",
    mname: "",
    lname: "",
    rank: "",
    photo_thumb: ""
}

export const TUSER = {  
    name: "",
    email: "",
    id: "",
    account_type: 0,
    fname: "",
    lname: "",
    username: "",
    photo: "",
    date_signup: "",
    mobile: "",
    activated: false,
    rank: 0
}

export const TEARNING = {
    topup: 0,
    direct: 0,    
    ctp: 0,    
    royalty: 0, 
    unilevel: 0, 
    direct_transferred: 0,
    direct_balance: 0,    
    indirect: 0,
    indirect_available: 0,
    indirect_transferred: 0,
    indirect_balance: 0,    
    ctp_transferred: 0,
    ctp_balance: 0,
    royalty_transferred: 0,
    royalty_balance: 0,
    unilevel_transferred: 0,
    unilevel_balance: 0,
    transferred: 0,
    accumulated: 0,
    net_balance: 0,  
    balance: 0,
    pending_indirect:0    
}

export const TWALLET = {
    accumulated : 0,
    withdrawal : 0,
    pending : 0,
    balance : 0
}

export const GENERAL_SET = {
    minimum_withdrawal: 0,    
    admin_fee: 0,
    is_admin_fee_percent: false,
    tax: 0,
    is_tax_percent: false,
    payout_sched: 0,
    disable_payout: false
}