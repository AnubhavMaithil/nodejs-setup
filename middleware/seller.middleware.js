const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/getTokenGenerate");
const { SellerModel } = require("../models/seller.model");

// Middleware to authenticate seller using JWT
exports.authenticateSeller = async (req, res, next) => {
    const token =
        req.headers["authorization"].split(" ")[1] ||
        req.cookies.token;
    if (!token) {
        return res
            .status(403)
            .json({ success: false, message: "No token provided." });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const seller = await SellerModel.findById({ _id: decode._id });
    if (!seller)
        return res
            .status(400)
            .json({ success: false, message: "Seller not found." });
    if (!seller.otpdetails.isVerified)
        return res
            .status(400)
            .json({ success: false, message: "Unauthorized User." });
    if (seller.tokenBlock.includes(token))
        return res
            .status(500)
            .json({ success: false, message: "Login Your Account User." });
    if (seller.isBlocked)
        return res
            .status(400)
            .json({ success: false, message: "Seller has been blocked." });
    req.seller = seller;
    next();
};
