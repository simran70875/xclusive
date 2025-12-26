const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = process.env.JWT_TOKEN;

// Middleware function to verify the JWT
const authenticates = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(200).json({ type: 'error', message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(200).json({ type: 'error', message: 'Invalid token.' });
    }
};

module.exports = authenticates;