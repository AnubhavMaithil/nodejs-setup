const crypto = require('crypto');

/**
 * Generates a One Time Password (OTP) and its expiration time.
 * 
 * @param {number} time - The duration in minutes for which the OTP is valid. Default is 10 minutes.
 * @returns {Object} An object containing the generated OTP and its expiration timestamp {otp, expireOtp}.
 */

exports.getOtpGenerate = (time = 10) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a random 6-digit OTP
    const expiresIn = time * 60 * 1000; // Convert minutes to milliseconds
    const expireOtp = Date.now() + expiresIn;
    return {otp,expireOtp};
}
