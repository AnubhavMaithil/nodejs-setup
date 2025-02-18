const { SellerModel } = require("../models/seller.model");
const { getToken } = require("../utils/getTokenGenerate");
const { getComparePassword, getHashPassword } = require("../utils/getPassword.password");
const { getOtpGenerate } = require("../utils/getOtpGenerate");
const { sendToOtp } = require("../utils/sendtootp.nodemailer");
const { uploadImageToImageKit } = require("../utils/uploadImageKit");


const {
    generateRandomReferralLink,
} = require("../utils/generateRandomReferralLink");

exports.SellerProfile = async (req, res) => {
    try {
        const seller = await SellerModel.findById(req.seller._id);
        res.status(200).json({
            success: true,
            message: "Seller Profile.",
            data: seller,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.SellerRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, mobileNumber, password, referral } =
            req.body;
        console.log(req.body);
        if (!firstName || !lastName || !email || !mobileNumber || !password)
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        const sellerEmailFind = await SellerModel.findOne({
            "email.primary": email,
        });
        const username = `${firstName.trim()} ${lastName.trim()}`;
        const newReferral = generateRandomReferralLink();
        const { otp, expireOtp } = getOtpGenerate();
        const hashPassword = await getHashPassword(password);
        if (sellerEmailFind) {
            if (sellerEmailFind.otpdetails.isVerified)
                return res
                    .status(400)
                    .json({ success: false, message: ShowMessage.emailExists });
            const newSeller = await SellerModel.findByIdAndUpdate(
                sellerEmailFind._id,
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
            // await sendToOtp({otp,user:newSeller,subject:EmailSendMessage.subjectVerify});
            await newSeller.save();
            return res.status(201).json({
                success: true,
                message: ShowMessage.registerMessage,
                data: newSeller,
            });
        }
        const sellerModelFind = await SellerModel.findOne({
            "mobile.primaryMobile": mobileNumber,
        });
        if (sellerModelFind)
            return res
                .status(400)
                .json({ success: false, message: ShowMessage.mobileExists });
        if (referral) {
            const referralFind = await SellerModel.findOne({
                referralLink: referral,
            });
            if (!referralFind)
                return res.status(400).json({
                    success: false,
                    message: ShowMessage.referralNotExists,
                });
            const newSeller = new SellerModel({
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
                user: newSeller,
                subject: EmailSendMessage.subjectVerify,
            });
            referralFind.partners.push(newSeller._id);
            await referralFind.save();
            await newSeller.save();
            return res.status(201).json({
                success: true,
                message: ShowMessage.registerMessage,
                data: newSeller,
            });
        }
        // const sellerModelFind = await SellerModel.findOne({'mobile.primaryMobile':mobileNumber});
        // if(sellerModelFind) return res.status(400).json({success:false,message: ShowMessage.mobileExists});
        const newSeller = new SellerModel({
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
            user: newSeller,
            subject: EmailSendMessage.subjectVerify,
        });
        if (referral) {
            const referralFind = await SellerModel.findOne({
                referralLink: referral,
            });
            if (!referralFind)
                return res.status(400).json({
                    success: false,
                    message: ShowMessage.referralNotExists,
                });
            referralFind.partners.push(newSeller._id);
            await referralFind.save();
        }
        await newSeller.save();
        return res.status(201).json({
            success: true,
            message: ShowMessage.registerMessage,
            data: newSeller,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.SellerOTPVerify = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const seller = await SellerModel.findOne({ "email.primary": email });
        if (!seller)
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        if (
            seller.otpdetails.otp !== otp ||
            seller.otpdetails.otpExpire < Date.now()
        )
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired OTP" });
        seller.otpdetails.isVerified = true;
        seller.otpdetails.otp = null;
        seller.otpdetails.expireOtp = null;
        // const token = await getToken(seller)
        // seller.token = token
        await seller.save();
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 day expiration
        // });
        res.status(200).json({
            success: true,
            message: "Seller Account verified successfully.",
            data: seller,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.SellerChangePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Both old and new passwords are required.",
        });
    }
    try {
        const user = await SellerModel.findById(req.user._id);
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

exports.SellerRegenerateOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res
                .status(400)
                .json({ success: false, message: "Email is required." });
        const seller = await SellerModel.findOne({ "email.primary": email });
        if (!seller)
            return res
                .status(400)
                .json({ success: false, message: "Seller not exists." });
        const { otp, expireOtp } = getOtpGenerate();
        seller.otpdetails.otp = otp;
        seller.otpdetails.expireOtp = expireOtp;
        const vf = await sendToOtp({
            subject: "Bionova Resend OTP Verification Code.",
            user: seller,
            otp,
        });
        await seller.save();
        console.log(seller);
        return res.status(200).json({
            success: true,
            message:
                "OTP has been regenerated. Please check your Gmail account for the OTP.",
            seller,
            vf,
        });
    } catch (error) { }
};

exports.SellerLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res
            .status(500)
            .json({ success: false, message: "All field Required." });
    try {
        const seller = await SellerModel.findOne({ "email.primary": email });
        if (!seller)
            return res
                .status(400)
                .json({ success: false, message: "Vendor not Exists." });
        if (seller.isBlocked)
            return res.status(400).json({
                success: false,
                message:
                    "Vendor is blocked. Contact Admin for further process.",
                status: "blocked",
                data: seller,
            });
        if (seller.isVendorVerified === "requested")
            return res.status(400).json({
                success: false,
                message: "Fill The form for verification.",
                status: "requested",
                data: seller,
            });
        if (seller.isVendorVerified === "pending")
            return res.status(400).json({
                success: false,
                message: "Vendor is pending for verification.",
                status: "pending",
                data: seller,
            });
        if (seller.isVendorVerified === "rejected")
            return res.status(400).json({
                success: false,
                message: "Vendor is rejected for verification.",
                status: "rejected",
                reason: seller.vendorRejectionReason,
                data: seller,
            });
        if (!seller)
            return res
                .status(400)
                .json({ success: false, message: "Vendor not Exists." });
        const isMatch = await getComparePassword(seller, password);
        if (!isMatch)
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        if (!seller.otpdetails.isVerified)
            return res.status(401).json({
                success: false,
                message: "Please verify your account",
            });
        const token = await getToken(seller);
        seller.token = token;
        await seller.save();
        res.cookie("token", token, {
            httpOnly: false,
            path: "/",
            secure: false, // HTTPS par kaam karega
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 din tak valid rahega
        });
        req.seller = seller;
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.SellerLogout = async (req, res) => {
    try {
        const seller = await SellerModel.findById(req.seller._id);
        seller.tokenBlock.push(seller.token);
        seller.token = null;
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

exports.GetSeller = async (req, res) => {
    try {
        const seller = req.seller;
        const newSeller = await SellerModel.findById(seller._id).populate(
            "addtocart"
        );
        // console.log(newSeller);
        return res.status(200).json({
            success: true,
            message: "Seller fetched successfully.",
            data: newSeller,
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
        const seller = await SellerModel.findOne({ email });
        if (!seller)
            return res
                .status(404)
                .json({ success: false, message: "Seller not found." });
        const { otp, expireOtp } = getOtpGenerate();
        seller.otpdetails.otp = otp;
        seller.$assertPopulatedotpdetails.expireOtp = expireOtp;
        await seller.save();
        sendToOtp({ otp, seller, subject: "Bionova Password Forgot OTP." });

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
        const seller = await SellerModel.findOne({ email });
        if (!seller)
            return res
                .status(404)
                .json({ success: false, message: "Seller not found." });
        if (seller.otp !== otp || seller.otpExpire < Date.now())
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired OTP" });
        const hashPassword = await getHashPassword(newPassword);
        // Clear OTP after verification
        seller.otpdetails.otp = null;
        seller.otpdetails.expireOtp = null;
        seller.password = hashPassword; // Ensure to hash the new password before saving
        await seller.save();

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
        const seller = await SellerModel.findByIdAndUpdate(
            req.seller._id,
            {
                name: { username, firstname, lastname },
                mobile: { primaryMobile: mobile },
                email: { primary: email },
            },
            { new: true }
        );
        if (!seller) {
            return res
                .status(404)
                .json({ success: false, message: "Seller not found" });
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
        const seller = await SellerModel.findById(id);
        if (!seller) {
            return res
                .status(404)
                .json({ success: false, message: "Seller not found." });
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

        // Update seller details
        const updatedSeller = await SellerModel.findByIdAndUpdate(
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
            updatedSeller.isUpdatedVendor = "pending";
            await updatedSeller.save();
        } else {
            updatedSeller.isVendorVerified = "pending";
            await updatedSeller.save();
        }

        return res.status(200).json({
            success: true,
            message: "Seller details updated successfully.",
            data: updatedSeller,
        });
    } catch (error) {
        console.error("Error in creating/updating general details:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
};


exports.getAllSellers = async (req, res) => {
    try {
        const sellers = await SellerModel.find();
        return res.status(200).json({ success: true, data: sellers });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

exports.getSellerDetails = async (req, res) => {
    try {
        const seller = await SellerModel.findById(req.params.id);
        return res.status(200).json({ success: true, data: seller });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};
