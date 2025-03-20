const router = require('express').Router();

const UserController = require('../controllers/user.controller');
const { authenticateUser } = require('../middleware/user.middleware');
const { UserModel } = require('../models/user.model');

// User registration route
const { userNotverifyAccountDelete } = require('../utils/verifyAccountCalculate');
setInterval(() => {
    userNotverifyAccountDelete();
}, 1000)


// ------------------------------------ACCOUINT DETAIL START -------------------------------------
// register
router.post('/register', UserController.UserRegister);
// User login
router.post('/login', UserController.UserLogin);
// get logged in user
router.get('/get-user', authenticateUser, UserController.GetUser);
// Verify OTP
router.post('/register-otp-verify', UserController.UserOTPVerify);
router.post('/regenerate-otp', UserController.UserRegenerateOTP);
router.post('/change-password', UserController.UserChangePassword);
router.post('/password-forgot', UserController.PasswordForgot);
router.post('/verify-forgot-password-otp', UserController.VerifyForgotPasswordOtp);

router.get('/profile', authenticateUser, UserController.UserProfile);

router.post('/fill-vendor-details/:id', UserController.fillVendorDetails);
router.post('/fill-vendor-details/:id/update', UserController.fillVendorDetails);

router.get('/get-all-users', UserController.getAllUsers)
router.get('/get-user-details/:id', UserController.getUserDetails)

module.exports = router;