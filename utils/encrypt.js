const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET; // Replace with your actual secret key

exports.getHashPassword = function (password) {
    const payload = { password: password };
    return jwt.sign(payload, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN });
};

exports.getComparePassword = function (user, password) {
    try {
        const decode = jwt.verify(user.password, secretKey);
        return decode.password === password;
    } catch (err) {
        return null;
    }
};