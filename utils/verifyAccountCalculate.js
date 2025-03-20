const { UserModel } = require('../models/user.model');
// Function to verify accounts
const userNotverifyAccountDelete = async () => {
    try {
        const users = await UserModel.find({});
        for (const user of users) {
            try {
                if (user.createdAt && new Date() - user.createdAt < 10 * 60 * 1000) {
                    continue; // Skip if account is created within the last 15 minutes
                };
                // Delete the account if not verified
                if (!user.otpdetails.isVerified) {
                    const deleteAccount = await UserModel.findByIdAndDelete(user._id);
                    if (deleteAccount) {
                        // console.log(`Account deleted: ${user.username}`);
                    }
                    await UserModel.findByIdAndUpdate(user.sponsor, { $pull: { partners: user._id } });
                }
            } catch (err) {
                // console.error("Error in userNotverifyAccountDelete:", err.message);
            }
        }
    } catch (err) {
        // console.error("Error in userNotverifyAccountDelete:", err.message);
    }
};

module.exports = { userNotverifyAccountDelete }
