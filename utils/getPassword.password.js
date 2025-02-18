// const bcrypt = require('bcryptjs')

// exports.getHashPassword = async function (password){
//     return await bcrypt.hash(password,10)
// }
// exports.getComparePassword = async function (user,password){
//     return await bcrypt.compare(password,user.password)
// }
const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key'; // Replace with your actual secret key

exports.getHashPassword = function (password) {
    const payload = { password:password };
    return jwt.sign(payload, secretKey, { expiresIn: '1y' });
};

exports.getComparePassword = function (user,password) {
    try {
        const decode = jwt.verify(user.password, secretKey);
        return decode.password === password;
    } catch (err) {
        return null;
    }
};