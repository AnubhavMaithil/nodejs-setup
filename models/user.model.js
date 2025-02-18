const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    mobile: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "management"],
        default: "admin"
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    otp: {
        type: String,
        default: null,
    },
    status: {
        type: Boolean,
        default: true
    }
});


userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.otp;
        return ret;
    }
});

userSchema.set('toObject', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.otp;
        return ret;
    }
});


module.exports = mongoose.model("user", userSchema);