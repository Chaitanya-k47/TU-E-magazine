const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure User model is imported
// const asyncHandler = require('./asyncHandler'); // If you use it

const protect = async (req, res, next) => { // Ensure it's async if User.findById is awaited
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded); // Log the decoded token

            // CRUCIAL: Fetch user from DB and attach to req.user
            // Ensure this User.findById is working and selecting necessary fields (like role)
            req.user = await User.findById(decoded.user.id).select('-password'); // Assuming decoded.user.id

            if (!req.user) { // If user linked to token doesn't exist anymore
                // This case should ideally not happen if tokens are managed well, but good to have
                return res.status(401).json({ success: false, error: 'Not authorized, user not found for token' });
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error.name, error.message);
            return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // This part is for routes that are STRICTLY protected.
        // For a route like getArticleById that can be public OR private,
        // you might want to allow it to proceed without a token, and then
        // the controller checks req.user. This depends on how you apply 'protect'.
        // If 'protect' is applied to the route, then no token means 401.
        // If 'protect' is NOT applied and the controller checks req.user, then it's fine.
        // Given your backend structure, protect IS LIKELY APPLIED to admin/editor specific routes,
        // but for /api/articles/:id, it might be public and the controller handles auth checks.
        // Let's assume for now that if an Admin token is sent, `protect` should work.
        return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
};

module.exports = { protect };