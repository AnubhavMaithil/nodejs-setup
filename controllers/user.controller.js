const { UserModel } = require("../models/user.model");
const { getToken } = require("../utils/getTokenGenerate");
const { getComparePassword, getHashPassword } = require("../utils/getPassword.password");
const { getOtpGenerate } = require("../utils/getOtpGenerate");
const { sendToOtp } = require("../utils/sendtootp.nodemailer");
const { uploadImageToImageKit } = require("../utils/uploadImageKit");


const {
    generateRandomReferralLink,
} = require("../utils/generateRandomReferralLink");

exports.UserProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);
        res.status(200).json({
            success: true,
            message: "User Profile.",
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.UserRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, mobileNumber, password, referral } =
            req.body;
        console.log(req.body);
        if (!firstName || !lastName || !email || !mobileNumber || !password)
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        const userEmailFind = await UserModel.findOne({
            "email.primary": email,
        });
        const username = `${firstName.trim()} ${lastName.trim()}`;
        const newReferral = generateRandomReferralLink();
        const { otp, expireOtp } = getOtpGenerate();
        const hashPassword = await getHashPassword(password);
        if (userEmailFind) {
            if (userEmailFind.otpdetails.isVerified)
                return res
                    .status(400)
                    .json({ success: false, message: ShowMessage.emailExists });
            const newUser = await UserModel.findByIdAndUpdate(
                userEmailFind._id,
                {
                    name: {
                        username,
                        firstname: firstName.trim(),
                        lastname: lastName.trim(),
                    },
                    email: {
                        primary: email,
                    },
                    mobile: {
                        primaryMobile: mobileNumber,
                    },
                    password: hashPassword,
                    otpdetails: {
                        otp: otp,
                        expireOtp: expireOtp,
                    },
                    referralLink: newReferral,
                    sponsor: referralFind,
                    role: "vendor",
                },
                { new: true }
            );
            // await sendToOtp({otp,user:newUser,subject:EmailSendMessage.subjectVerify});
            await newUser.save();
            return res.status(201).json({
                success: true,
                message: ShowMessage.registerMessage,
                data: newUser,
            });
        }
        const userModelFind = await UserModel.findOne({
            "mobile.primaryMobile": mobileNumber,
        });
        if (userModelFind)
            return res
                .status(400)
                .json({ success: false, message: ShowMessage.mobileExists });
        if (referral) {
            const referralFind = await UserModel.findOne({
                referralLink: referral,
            });
            if (!referralFind)
                return res.status(400).json({
                    success: false,
                    message: ShowMessage.referralNotExists,
                });
            const newUser = new UserModel({
                name: {
                    username,
                    firstname: firstName.trim(),
                    lastname: lastName.trim(),
                },
                email: {
                    primary: email,
                },
                mobile: {
                    primaryMobile: mobileNumber,
                },
                password: hashPassword,
                otpdetails: {
                    otp: otp,
                    expireOtp: expireOtp,
                },
                referralLink: newReferral,
                sponsor: referralFind,
                role: "vendor",
            });
            await sendToOtp({
                otp,
                user: newUser,
                subject: EmailSendMessage.subjectVerify,
            });
            referralFind.partners.push(newUser._id);
            await referralFind.save();
            await newUser.save();
            return res.status(201).json({
                success: true,
                message: ShowMessage.registerMessage,
                data: newUser,
            });
        }
        // const userModelFind = await UserModel.findOne({'mobile.primaryMobile':mobileNumber});
        // if(userModelFind) return res.status(400).json({success:false,message: ShowMessage.mobileExists});
        const newUser = new UserModel({
            name: {
                username,
                firstname: firstName.trim(),
                lastname: lastName.trim(),
            },
            email: { primary: email },
            mobile: { primaryMobile: mobileNumber },
            password: hashPassword,
            otpdetails: { otp: otp, expireOtp: expireOtp },
            referralLink: newReferral,
            role: "vendor",
        });
        await sendToOtp({
            otp,
            user: newUser,
            subject: EmailSendMessage.subjectVerify,
        });
        if (referral) {
            const referralFind = await UserModel.findOne({
                referralLink: referral,
            });
            if (!referralFind)
                return res.status(400).json({
                    success: false,
                    message: ShowMessage.referralNotExists,
                });
            referralFind.partners.push(newUser._id);
            await referralFind.save();
        }
        await newUser.save();
        return res.status(201).json({
            success: true,
            message: ShowMessage.registerMessage,
            data: newUser,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.UserOTPVerify = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await UserModel.findOne({ "email.primary": email });
        if (!user)
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        if (
            user.otpdetails.otp !== otp ||
            user.otpdetails.otpExpire < Date.now()
        )
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired OTP" });
        user.otpdetails.isVerified = true;
        user.otpdetails.otp = null;
        user.otpdetails.expireOtp = null;
        // const token = await getToken(user)
        // user.token = token
        await user.save();
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 day expiration
        // });
        res.status(200).json({
            success: true,
            message: "User Account verified successfully.",
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.UserChangePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Both old and new passwords are required.",
        });
    }
    try {
        const user = await UserModel.findById(req.user._id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        const isMatch = await getComparePassword(user, oldPassword);
        // const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Old password is incorrect" });
        }
        const hashPassword = await getHashPassword(newPassword);
        user.password = hashPassword; // Ensure to hash the new password before saving
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.UserRegenerateOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res
                .status(400)
                .json({ success: false, message: "Email is required." });
        const user = await UserModel.findOne({ "email.primary": email });
        if (!user)
            return res
                .status(400)
                .json({ success: false, message: "User not exists." });
        const { otp, expireOtp } = getOtpGenerate();
        user.otpdetails.otp = otp;
        user.otpdetails.expireOtp = expireOtp;
        const vf = await sendToOtp({
            subject: "Bionova Resend OTP Verification Code.",
            user: user,
            otp,
        });
        await user.save();
        console.log(user);
        return res.status(200).json({
            success: true,
            message:
                "OTP has been regenerated. Please check your Gmail account for the OTP.",
            user,
            vf,
        });
    } catch (error) { }
};

exports.UserLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res
            .status(500)
            .json({ success: false, message: "All field Required." });
    try {
        const user = await UserModel.findOne({ "email.primary": email });
        if (!user)
            return res
                .status(400)
                .json({ success: false, message: "Vendor not Exists." });
        if (user.isBlocked)
            return res.status(400).json({
                success: false,
                message:
                    "Vendor is blocked. Contact Admin for further process.",
                status: "blocked",
                data: user,
            });
        if (user.isVendorVerified === "requested")
            return res.status(400).json({
                success: false,
                message: "Fill The form for verification.",
                status: "requested",
                data: user,
            });
        if (user.isVendorVerified === "pending")
            return res.status(400).json({
                success: false,
                message: "Vendor is pending for verification.",
                status: "pending",
                data: user,
            });
        if (user.isVendorVerified === "rejected")
            return res.status(400).json({
                success: false,
                message: "Vendor is rejected for verification.",
                status: "rejected",
                reason: user.vendorRejectionReason,
                data: user,
            });
        if (!user)
            return res
                .status(400)
                .json({ success: false, message: "Vendor not Exists." });
        const isMatch = await getComparePassword(user, password);
        if (!isMatch)
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        if (!user.otpdetails.isVerified)
            return res.status(401).json({
                success: false,
                message: "Please verify your account",
            });
        const token = await getToken(user);
        user.token = token;
        await user.save();
        res.cookie("token", token, {
            httpOnly: false,
            path: "/",
            secure: false, // HTTPS par kaam karega
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 din tak valid rahega
        });
        req.user = user;
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.UserLogout = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);
        user.tokenBlock.push(user.token);
        user.token = null;
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        return res
            .status(200)
            .json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Server error" });
    }
};

exports.GetUser = async (req, res) => {
    try {
        const user = req.user;
        const newUser = await UserModel.findById(user._id).populate(
            "addtocart"
        );
        // console.log(newUser);
        return res.status(200).json({
            success: true,
            message: "User fetched successfully.",
            data: newUser,
        });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Server error" });
    }
};

exports.PasswordForgot = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res
            .status(400)
            .json({ success: false, message: "Email is required." });
    try {
        const user = await UserModel.findOne({ email });
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        const { otp, expireOtp } = getOtpGenerate();
        user.otpdetails.otp = otp;
        user.$assertPopulatedotpdetails.expireOtp = expireOtp;
        await user.save();
        sendToOtp({ otp, user, subject: "Bionova Password Forgot OTP." });

        return res
            .status(200)
            .json({ success: true, message: "OTP sent to your email." });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Server error." });
    }
};

exports.VerifyForgotPasswordOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp)
        return res
            .status(400)
            .json({ success: false, message: "Email and OTP are required." });
    try {
        const user = await UserModel.findOne({ email });
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        if (user.otp !== otp || user.otpExpire < Date.now())
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired OTP" });
        const hashPassword = await getHashPassword(newPassword);
        // Clear OTP after verification
        user.otpdetails.otp = null;
        user.otpdetails.expireOtp = null;
        user.password = hashPassword; // Ensure to hash the new password before saving
        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified and Password reset successfully.",
        });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Server error." });
    }
};

exports.ClientProfileUpdate = async (req, res) => {
    const { username, mobile, email, firstname, lastname } = req.body;
    if (!username || !mobile || !email)
        return res
            .status(400)
            .json({ success: false, message: "All fields are required." });

    try {
        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                name: { username, firstname, lastname },
                mobile: { primaryMobile: mobile },
                email: { primary: email },
            },
            { new: true }
        );
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.fillVendorDetails = async (req, res) => {
    const id = req.params.id;
    const {
        vendorName,
        primaryContact,
        secondaryContact,
        email,
        designation,
        country,
        state,
        city,
        pincode,
        companyName,
        businessType,
        gstin,
        nocExpiryDate,
        mcaExpiryDate,
        adharCardImg,
        panCardImg,
        mcaImg,
        gstCertificateImg,
        businessAddressImg,
        businessEmail,
        businessMobile,
        aadharNo,
        pancardNo,
        mcaNo,
        address,
        businessPancardNo,
        businessPanCardImg,
        holdername,
        branchName,
        bankname,
        passbook,
        accountNumber,
        ifsccode,
    } = req.body;

    if (
        !vendorName ||
        !primaryContact ||
        !secondaryContact ||
        !email ||
        !address ||
        !city ||
        !state ||
        !country ||
        !pincode ||
        !designation ||
        !businessType ||
        !gstin ||
        !nocExpiryDate ||
        !mcaExpiryDate ||
        !adharCardImg ||
        !panCardImg ||
        !mcaImg ||
        !gstCertificateImg ||
        !businessAddressImg ||
        !businessEmail ||
        !aadharNo ||
        !pancardNo ||
        !mcaNo ||
        !companyName ||
        !holdername ||
        !branchName ||
        !bankname ||
        !passbook ||
        !businessMobile ||
        !accountNumber ||
        !ifsccode ||
        !businessPanCardImg ||
        !businessPancardNo
    ) {
        return res
            .status(400)
            .json({ success: false, message: "All fields are required." });
    }

    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        const uploadImageIfUrl = async (image, folder) => {
            if (!image) return null;

            // Check if image is a valid URL (supports http & https)
            const isValidUrl =
                /^(http|https):\/\/.*\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(
                    image
                );

            return isValidUrl
                ? image
                : await uploadImageToImageKit(image, folder); // Return URL if valid, otherwise null
        };

        const aadharCardImgFileName = await uploadImageIfUrl(
            adharCardImg,
            "generaldetail"
        );
        const panCardImgFileName = await uploadImageIfUrl(
            panCardImg,
            "generaldetail"
        );
        const businessPanCardImgFileName = await uploadImageIfUrl(
            businessPanCardImg,
            "generaldetail"
        );
        const passbookFileName = await uploadImageIfUrl(
            passbook,
            "generaldetail"
        );
        const businessAddImg = await uploadImageIfUrl(
            businessAddressImg,
            "generaldetail"
        );
        const mcaImgFileName = await uploadImageIfUrl(mcaImg, "generaldetail");

        // Update user details
        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    name: { username: vendorName },
                    "mobile.primaryMobile": primaryContact,
                    "mobile.secondaryMobile": secondaryContact,
                    "email.primary": email,

                    "generaldetails.uidai.number": aadharNo,
                    "generaldetails.uidai.file": aadharCardImgFileName,
                    "generaldetails.pancard.number": pancardNo,
                    "generaldetails.pancard.file": panCardImgFileName,
                    "generaldetails.address.address": address,
                    "generaldetails.city": city,
                    "generaldetails.state": state,
                    "generaldetails.country": country,
                    "generaldetails.pincode": pincode,
                    "generaldetails.designation": designation,

                    "bankdetails.holdername": holdername,
                    "bankdetails.branchName": branchName,
                    "bankdetails.bankname": bankname,
                    "bankdetails.passbook": passbookFileName,
                    "bankdetails.pincode": pincode,
                    "bankdetails.accountNumber": accountNumber,
                    "bankdetails.ifsccode": ifsccode,
                    "bankdetails.proofdetail.proofid": pancardNo,
                    "bankdetails.proofdetail.prooffile": panCardImgFileName,

                    "shopdetails.shopname": companyName,
                    "shopdetails.businessType": businessType,
                    "shopdetails.gstDetail.number": gstin,
                    "shopdetails.gstDetail.file": gstCertificateImg,
                    "shopdetails.nocExpiryDate": nocExpiryDate,
                    "shopdetails.mcaDetails.number": mcaNo,
                    "shopdetails.mcaDetails.expireDate": mcaExpiryDate,
                    "shopdetails.mcaDetails.file": mcaImgFileName,
                    "shopdetails.contactDetail.primary": primaryContact,
                    "shopdetails.contactDetail.secondary": secondaryContact,
                    "shopdetails.emailDetail.primary": businessEmail,
                    "shopdetails.emailDetail.secondary": null,
                    "shopdetails.pancard.number": businessPancardNo,
                    "shopdetails.pancard.file": businessPanCardImgFileName,
                    "shopdetails.address.file": businessAddImg,
                    "shopdetails.address.proof": address,
                    "shopdetails.city": city,
                    "shopdetails.state": state,
                    "shopdetails.country": country,
                    "shopdetails.pincode": pincode,
                },
            },
            { new: true, runValidators: true }
        );

        if (req.path.includes("/update")) {
            updatedUser.isUpdatedVendor = "pending";
            await updatedUser.save();
        } else {
            updatedUser.isVendorVerified = "pending";
            await updatedUser.save();
        }

        return res.status(200).json({
            success: true,
            message: "User details updated successfully.",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error in creating/updating general details:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};
