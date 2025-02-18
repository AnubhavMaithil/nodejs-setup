const router = require('express').Router();

const SellerController = require('../controllers/seller.controller');
const { authenticateSeller } = require('../middleware/seller.middleware');
const { SellerModel } = require('../models/seller.model');

// User registration route
const { sellerNotverifyAccountDelete } = require('../utils/verifyAccountCalculate');
setInterval(() => {
    sellerNotverifyAccountDelete();
}, 1000)


// ------------------------------------ACCOUINT DETAIL START -------------------------------------
// register
router.post('/register', SellerController.SellerRegister);
// User login
router.post('/login', SellerController.SellerLogin);
// get logged in user
router.get('/get-user', authenticateSeller, SellerController.GetSeller);
// Verify OTP
router.post('/register-otp-verify', SellerController.SellerOTPVerify);
router.post('/regenerate-otp', SellerController.SellerRegenerateOTP);
router.post('/change-password', SellerController.SellerChangePassword);
router.post('/password-forgot', SellerController.PasswordForgot);
router.post('/verify-forgot-password-otp', SellerController.VerifyForgotPasswordOtp);

router.get('/profile', authenticateSeller, SellerController.SellerProfile);

router.post('/fill-vendor-details/:id', SellerController.fillVendorDetails);
router.post('/fill-vendor-details/:id/update', SellerController.fillVendorDetails);

router.get('/get-all-sellers', SellerController.getAllSellers)
router.get('/get-seller-details/:id', SellerController.getSellerDetails)

module.exports = router;