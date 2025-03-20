const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/getTokenGenerate");
const { UserModel } = require("../models/user.model");

// Middleware to authenticate user using JWT
exports.authenticateUser = async (req, res, next) => {
    const token =
        req.headers["authorization"].split(" ")[1] ||
        req.cookies.token;
    if (!token) {
        return res
            .status(403)
            .json({ success: false, message: "No token provided." });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById({ _id: decode._id });
    if (!user)
        return res
            .status(400)
            .json({ success: false, message: "User not found." });
    if (!user.otpdetails.isVerified)
        return res
            .status(400)
            .json({ success: false, message: "Unauthorized User." });
    if (user.tokenBlock.includes(token))
        return res
            .status(500)
            .json({ success: false, message: "Login Your Account User." });
    if (user.isBlocked)
        return res
            .status(400)
            .json({ success: false, message: "User has been blocked." });
    req.user = user;
    next();
};
