const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 👈 import your user model

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded); // Log the decoded token

            // 👇 Fetch user from DB using the id from the decoded token
            const user = await User.findById(decoded.user.id);  // Use req.user.id now
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            req.user = user;

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
