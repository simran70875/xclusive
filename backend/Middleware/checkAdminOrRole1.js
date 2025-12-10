const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_TOKEN;
const Admin = require('../Models/Admin/admin_model');
const SubAdmin = require('../Models/Admin/subAdmin_model');


// Create a middleware that checks if the user has either "admin" or "role_2" role
const checkAdminOrRole1 = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(200).json({ type: 'error', message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);

        if (decoded) {
            const subAdmin = await SubAdmin.findById(decoded?.id);
            const admin = await Admin.findById(decoded?.id);

            if (!subAdmin && !admin) {
                return res.status(200).json({ type: 'error', message: 'Invalid token.' });
            }

            // Check if the user has either "admin" or "role_2" role
            if (admin || (subAdmin && subAdmin.role === 'role_1')) {
                req.subAdmin = decoded;
                req.admin = decoded;
                next();
            } else {
                res.status(200).json({ type: 'error', message: 'Access denied. Insufficient permissions.' });
            }
        } else {
            res.status(200).json({ type: 'error', message: 'Access denied. Invalid token.' });
        }
    } catch (error) {
        res.status(200).json({ type: 'error', message: 'Invalid token.' });
    }
};

module.exports = checkAdminOrRole1;
