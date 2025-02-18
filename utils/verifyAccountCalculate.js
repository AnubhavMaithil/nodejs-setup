const { SellerModel } = require('../models/seller.model');
// Function to verify accounts
const sellerNotverifyAccountDelete = async () => {
    try {
        const sellers = await SellerModel.find({});
        for (const seller of sellers) {
            try {
                if (seller.createdAt && new Date() - seller.createdAt < 10 * 60 * 1000) {
                    continue; // Skip if account is created within the last 15 minutes
                };
                // Delete the account if not verified
                if (!seller.otpdetails.isVerified) {
                    const deleteAccount = await SellerModel.findByIdAndDelete(seller._id);
                    if (deleteAccount) {
                        // console.log(`Account deleted: ${seller.sellername}`);
                    }
                    await SellerModel.findByIdAndUpdate(seller.sponsor, { $pull: { partners: seller._id } });
                }
            } catch (err) {
                // console.error("Error in sellerNotverifyAccountDelete:", err.message);
            }
        }
    } catch (err) {
        // console.error("Error in sellerNotverifyAccountDelete:", err.message);
    }
};

module.exports = { sellerNotverifyAccountDelete }
