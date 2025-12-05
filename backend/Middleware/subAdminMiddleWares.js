const jwt = require('jsonwebtoken');
let secretKey = process.env.JWT_TOKEN;
const SubAdmin = require('../Models/Admin/subAdmin_model');

const checkSubAdminRole = (requiredRole) => async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(200).json({ type: 'error', message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);

        if (decoded) {

            const subAdmin = await SubAdmin.findById(decoded?.id);

            if (!subAdmin) {
                return res.status(200).json({ type: 'error', message: 'Invalid token.' });
            }
            if (subAdmin.role === requiredRole) {
                req.subAdmin = decoded;
                next();
            } else {
                res.status(200).json({ type: 'error', message: 'Access denied. Insufficient permissions.' });
            }
        } else {
            res.status(200).json({ type: 'error', message: 'Access denied. Only sub admins allowed.' });
        }
    } catch (error) {
        res.status(200).json({ type: 'error', message: 'Invalid token.' });
    }
};

module.exports = checkSubAdminRole;
