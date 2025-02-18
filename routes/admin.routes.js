// this is admin routes file
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

const checkAdminLoggedIn = require('../middleware/admin.middleware');

// Admin management
router.post('/login', adminController.loginAdmin);
router.post('/create-admin', adminController.createAdmin);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);
router.get('/logout', adminController.logoutAdmin);

// Apply authentication middleware to routes that require authentication
router.use(checkAdminLoggedIn);

router.get('/get-admin', checkAdminLoggedIn, adminController.getAdmin);

// router.get('/get-members', checkAdminLoggedIn, adminController.getMembers);

// router.get('/get-member/:id', checkAdminLoggedIn, adminController.getMember);

// User verify routes
// router.get('/get-users-list-to-verify', checkAdminLoggedIn, adminController.getSellerListToVerify);


module.exports = router;