// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middlewares/asyncHandler');
const { ErrorResponse } = require('../middlewares/errorMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
    // Validation for name, email, password, role is now handled by express-validator in the route
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorResponse('User already exists with this email', 400));
    }

    user = new User({ name, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
        user: { id: user.id, role: user.role, name: user.name }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err);
                return next(new ErrorResponse('Error generating token', 500));
            }
            res.status(201).json({ success: true, token });
        }
    );
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
    // Validation for email, password is now handled by express-validator in the route
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    const payload = {
        user: { id: user.id, role: user.role, name: user.name }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err);
                return next(new ErrorResponse('Error generating token', 500));
            }
            res.status(200).json({ success: true, token });
        }
    );
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    // req.user is already populated by the 'protect' middleware
    // We just need to ensure we are sending back the user data without the password
    // If User.findById(req.user.id).select('-password') was done in protect, this is simpler.
    // Assuming req.user from protect middleware already has password excluded:
    if (!req.user) { // Should be caught by protect, but as a safeguard
        return next(new ErrorResponse('User not found, something went wrong with authentication', 404));
    }

    // Fetch fresh user data to ensure it's up-to-date, excluding password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new ErrorResponse('Please provide current password and new password', 400));
    }

    // Password length validation (can also be done with express-validator)
    if (newPassword.length < 6) {
         return next(new ErrorResponse('New password must be at least 6 characters long', 400));
    }


    // Get user from DB (req.user is set by 'protect' middleware)
    // We need to select the password here because it's usually not selected by default
    const user = await User.findById(req.user.id).select('+password');

    if (!user) { // Should not happen if protect middleware worked
        return next(new ErrorResponse('User not found', 404));
    }

    // Check if currentPassword matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return next(new ErrorResponse('Incorrect current password', 401));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Optional: Send back a new token if you want to refresh it, or just success
    // For simplicity, just success message. User's existing token remains valid.
    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});
