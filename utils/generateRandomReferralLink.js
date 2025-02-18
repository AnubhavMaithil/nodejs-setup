exports.generateRandomReferralLink = () => {
    const randomId = Math.random().toString(36).substring(2, 10); // Generate a random string
    return `BIONOVA${randomId}`;
};