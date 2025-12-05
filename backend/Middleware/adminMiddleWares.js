const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_TOKEN;
const Admin = require('../Models/Admin/admin_model');

const checkAdminRole = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(200).json({ type: 'error', message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);

        if (decoded?.role !== "admin") {
            return res.status(200).json({ type: 'error', message: 'Access denied. Only admin allowed to perform this.' });
        }

        if (decoded) {
            req.admin = decoded;
            next();
        } else {
            res.status(200).json({ type: 'error', message: 'Access denied. Only admin allowed.' });
        }

    } catch (error) {
        res.status(200).json({ type: 'error', message: 'Access denied. Only admin allowed.' });
    }
};

module.exports = checkAdminRole;
