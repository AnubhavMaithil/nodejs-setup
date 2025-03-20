const jwt = require('jsonwebtoken');
const user = require('../models/admin.model');

const checkAdminLoggedIn = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1] || req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await user.findOne({ _id: decoded.id });
        if (!admin) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = checkAdminLoggedIn;
