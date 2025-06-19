// TU-E-NEWS-BACKEND/middlewares/optionalAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach user to request object if token is valid
            req.user = await User.findById(decoded.user.id).select('-password');
            // Note: If user not found for a valid token, req.user will be null.
            // Your controller should handle if req.user is null even after this attempt.
        } catch (error) {
            // Token is invalid or expired, but we don't block the request.
            // We simply don't set req.user, or explicitly set it to null.
            console.log('Optional auth: Token present but invalid/expired - proceeding without user.', error.name);
            req.user = null; // Or just let it be undefined
        }
    }
    // If no token, or if token was invalid, req.user will be undefined/null.
    // Always call next() to proceed to the controller.
    next();
};

module.exports = optionalAuth;