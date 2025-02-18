const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')

const sellerSchema = new mongoose.Schema({
    picture: {
        type: String,
        default: null
    },
    name: {
        username: { type: String, default: null },
        firstname: { type: String, default: null },
        lastname: { type: String, default: null }
    },
    email: {
        primary: { type: String, default: null },
        secondary: { type: String, default: null }
    },
    mobile: {
        primaryMobile: { type: String, default: null },
        isVerifyMobile: { type: Boolean, default: false },
        secondaryMobile: { type: String, default: null }
    },
    sellerID: { type: String, default: null, unique: true },
    password: { type: String, default: null },
    referralLink: { type: String, default: null },
    activationdetails: {
        isActive: { type: Boolean, default: false },
        activeDate: { type: Date, default: null }
    },
    role: {
        type: String,
        enum: ['user', 'vendor', 'seller', 'superadmin', 'support', 'partner', 'sponsor'],
        default: "user"
    },
    otpdetails: {
        isVerified: { type: Boolean, default: false },
        otp: { type: String, default: null },
        expireOtp: { type: Date, default: null }
    },
    partners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sellerdetail' }],
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sellerdetail' },
    bankdetails: {
        holdername: { type: String, default: null },
        bankname: { type: String, default: null },
        branchName: { type: String, default: null },
        passbook: { type: String, default: null },
        proofdetail: {
            proofid: { type: String, default: null },
            prooffile: { type: String, default: null }
        },
        pincode: { type: String, default: null },
        accountNumber: { type: Number, default: null },
        ifsccode: { type: String, default: null }
    },
    amountdetails: {
        investment: { type: Number, default: 0 },
        totalIncome: { type: Number, default: 0 },
        currentIncome: { type: Number, default: 0 },
        selfIncome: { type: Number, default: 0 },
        transaction: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
        withdrawal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Withdrawal' }]
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    referrals: {
        referralIncomes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Withdrawal' }],
        referralIncome: { type: Number, default: 0 }
    },
    levels: {
        levels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Level' }],
        levelType: { type: Number, default: 0 },
        levelIncome: { type: Number, default: 0 },
        lastLevelIncomeCalculation: { type: Date, default: null }
    },
    supports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Support' }],
    token: { type: String, default: null },
    tokenBlock: { type: Array, default: [] },
    generaldetails: {
        verification: { type: Boolean, default: false },
        uidai: {
            number: { type: String, default: null },
            file: { type: String, default: null }
        },
        pancard: {
            number: { type: String, default: null },
            file: { type: String, default: null }
        },
        address: {
            file: { type: String, default: null },
            proof: { type: String, default: null }
        },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        pincode: { type: String, default: null },
        designation: { type: String, default: null }
    },
    isVendorVerified: {
        type: String,
        enum: ["requested", 'pending', 'approved', 'rejected'],
        default: 'requested'
    },
    vendorRejectionReason: { type: String, default: null },
    isUpdatedVendor: {
        type: String,
        enum: ["requested", 'pending', 'approved', 'rejected'],
        default: 'requested'
    },
    shopdetails: {
        shopname: { type: String, default: null },
        businessType: { type: String, default: null },
        mcaDetails: {
            number: { type: String, default: null },
            expireDate: { type: String, default: null },
            file: { type: String, default: null }
        },
        contactDetail: {
            primary: { type: String, default: null },
            secondary: { type: String, default: null }
        },
        emailDetail: {
            primary: { type: String, default: null },
            secondary: { type: String, default: null }
        },
        pancard: {
            number: { type: String, default: null },
            file: { type: String, default: null }
        },
        address: {
            file: { type: String, default: null },
            proof: { type: String, default: null }
        },
        gstDetail: {
            number: { type: String, default: null },
            file: { type: String, default: null }
        },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        pincode: { type: String, default: null },
        nocExpiryDate: { type: String, default: null },
    },
    messages: { type: Object, default: {} },
    // products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product", default: [] }],
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "product", default: [] }],
    addtocart: [{ type: mongoose.Schema.Types.ObjectId, ref: "SellerAddToCart", default: [] }],
    themeMenage: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

// // // Exclude the password field by default when converting documents to JSON or objects
sellerSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password; // Remove password field
        delete ret.token; // Remove password field
        delete ret.tokenBlock; // Remove password field
        delete ret.otpdetails; // Remove password field
        return ret;
    }
});

sellerSchema.set('toObject', {
    transform: (doc, ret) => {
        delete ret.password; // Remove password field
        delete ret.token; // Remove password field
        delete ret.tokenBlock; // Remove password field
        return ret;
    }
});

exports.SellerModel = mongoose.model('Sellerdetail', sellerSchema)