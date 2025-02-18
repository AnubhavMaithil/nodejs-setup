const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    members: [{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "user"
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    otp: {
        type: String,
        default: null,
    },
    toggles: {
        emailOnFollow: {
            type: Boolean,
            default: false
        },
        emailOnPostAnswer: {
            type: Boolean,
            default: false
        },
        emailOnMention: {
            type: Boolean,
            default: false
        },
        notifyNewLaunches: {
            type: Boolean,
            default: false
        },
        notifyProductUpdates: {
            type: Boolean,
            default: false
        },
        subscribeToNewsletter: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: Boolean,
        default: true
    }
});

// Pre-save middleware to conditionally add toggles
userSchema.pre('save', function (next) {
    if (this.role === "admin") {
        this.toggles = undefined; // Remove toggles for admin
    }
    next();
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