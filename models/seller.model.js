const mongoose = require("mongoose")

const sellerSchema = new mongoose.Schema({
    picture: {
        type: String,
        default: null
    },
    name: { type: String, default: null },
    email: {
        type: String, default: null
    },
    mobile: { type: String, default: null },
    password: { type: String, default: null },
    activationdetails: {
        isActive: { type: Boolean, default: false },
        activeDate: { type: Date, default: null }
    },
    role: {
        type: String,
        enum: ['user', 'seller'],
        default: "user"
    },
    otpdetails: {
        isVerified: { type: Boolean, default: false },
        otp: { type: String, default: null },
        expireOtp: { type: Date, default: null }
    },
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
    isUserVerified: {
        type: String,
        enum: ["requested", 'pending', 'approved', 'rejected'],
        default: 'requested'
    },
    userRejectionReason: { type: String, default: null },
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