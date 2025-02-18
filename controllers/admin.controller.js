const user = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const { getComparePassword, getHashPassword } = require('../utils/encrypt');


exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin username
    const admin = await user.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    //compre password
    const isMatch = await getComparePassword(admin, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate jdablooT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    // save token to cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    req.admin = admin;

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    next(error); // Forward kardena bhaiya error ko
  }
};

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, name, mobile } = req.body;

    // Validate input karegaaaaaaaa
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if admin already hai 
    const existingAdmin = await user.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email already exists' });
    }
    const hashPassword = await getHashPassword(password);
    // Create kardo admin ko
    const newAdmin = new user({
      email,
      password: hashPassword,
      role: 'admin',
      name,
      mobile
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    // dont send password and otp field in response
    res.status(200).json(admin);
  } catch (error) {
    console.error('Error getting admin:', error);
    res.status(500).json({ message: error.message });
  }
}

exports.logoutAdmin = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: error.message });
  }
}

// forgot password
const otpStore = new Map(); // { "user_email": { otp, expiresAt } }
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await user.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    // send email to admin
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    otpStore.set(email, { otp, expiresAt });

    await sendEmail(email, otp);

    res.status(200).json({ message: 'Password reset otp sent to email', otp });
  } catch (error) {
    console.error('Error forgot password:', error);
    res.status(500).json({ message: error.message });
  }
}
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    // Check if OTP is valid
    const storedOTP = otpStore.get(email);
    if (!storedOTP || storedOTP.otp !== otp || storedOTP.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await user.findOneAndUpdate({ email }, { password: hashedPassword });

    // Remove OTP from store after successful reset
    otpStore.delete(email);

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Error reset password:', error);
    res.status(500).json({ message: error.message });
  }
}


// get members
// exports.getMembers = async (req, res) => {
//   try {
//     const members = await user.find({ role: { $ne: 'admin' } });
//     res.status(200).json({ members });
//   } catch (error) {
//     console.error('Error getting members:', error);
//     res.status(500).json({ message: error.message });
//   }
// }

// exports.getMember = async (req, res) => {
//   try {
//     const member = await user.findById(req.params.id);
//     res.status(200).json({ member });
//   } catch (error) {
//     console.error('Error getting member:', error);
//     res.status(500).json({ message: error.message });
//   }
// }

// seller verify routes
// exports.getSellerListToVerify = async (req, res) => {
//   try {
//     const sellers = await SellerModel.find({ $or: [{ isVendorVerified: "pending" }, { isUpdatedVendor: "pending" }] });
//     res.status(200).json({ data: sellers });
//   } catch (error) {
//     console.error('Error getting seller list:', error);
//     res.status(500).json({ message: error.message });
//   }
// }