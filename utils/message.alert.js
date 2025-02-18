exports.Message = {
    success: (res, message, data) => {
        return res.status(200).json({ success: true, message, data });
    },
    error: (res, message) => {
        return res.status(500).json({ success: false, message });
    },
    notFound: (res, message) => {
        return res.status(404).json({ success: false, message });
    },
    badRequest: (res, message) => {
        return res.status(400).json({ success: false, message });
    },
    unauthorized: (res, message) => {
        return res.status(401).json({ success: false, message });
    },
    forbidden: (res, message) => {
        return res.status(403).json({ success: false, message });
    },
    created: (res, message, data) => {
        return res.status(201).json({ success: true, message, data });
    }
}

exports.ShowMessage = {
    login:"Login successfully.",
    loginError:"Invalid email or password.",
    registerMessage:"Vendor created successfully. Please Verify your account.",
    allFieldsRequired:"All fields are required",
    emailExists:"Vendor Email already exists.",
    mobileExists:"Vendor Mobile already exists.",
    referralNotExists:"Referral link does not exist",
    accountVerify:"Please Verify your account.",
    accountVerifyOtp:"Please Verify your account.",
    accountVerifyOtpSubject:"Bionova Account Verification OTP ✔",
    accountVerifyOtpMessage:"Please Verify your account.",
    accountVerifyOtpMessageSubject:"Bionova Account Verification OTP ✔",
    accountVerifyOtpMessageError:"Invalid OTP.",
    accountVerifyOtpMessageSuccess:"Account verified successfully.",
    accountVerifyOtpMessageSuccessSubject:"Bionova Account Verification Success ✔",
    accountVerifyOtpMessageResend:"OTP resend successfully.",
    accountVerifyOtpMessageResendSubject:"Bionova Account Verification OTP Resend ✔",
    accountVerifyOtpMessageResendError:"OTP already verified.",
    accountVerifyOtpMessageResendErrorSubject:"Bionova Account Verification OTP Already Verified ✔",
    accountVerifyOtpMessageResendErrorTime:"OTP expired.",
    accountVerifyOtpMessageResendErrorTimeSubject:"Bionova Account Verification OTP Expired ✔",
}
exports.EmailSendMessage = {
    subjectVerify:"Bionova Account Verification OTP ✔",
    subjectForgot:"Bionova Password Forgot OTP.",
    subjectResend:"Bionova Resend OTP Verification Code.",
    message:"Please Verify your account."
}
