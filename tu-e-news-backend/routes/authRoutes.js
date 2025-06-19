// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updatePassword } = require('../controllers/authController');
const { body, validationResult } = require('express-validator'); // Import
const { ErrorResponse } = require('../middlewares/errorMiddleware'); // To format validation errors
const { protect } = require('../middlewares/authMiddleware');

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Format errors to be consistent with ErrorResponse
        // You can choose to send all errors or just the first one
        const errorMessages = errors.array().map(err => err.msg);
        return next(new ErrorResponse(errorMessages.join(', '), 400));
    }
    next();
};

const updatePasswordValidationRules = [
    body('currentPassword', 'Current password is required').notEmpty(),
    body('newPassword', 'New password is required and must be at least 6 characters')
        .notEmpty().isLength({ min: 6 }),
    body('confirmNewPassword', 'Confirm new password is required').notEmpty()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('New passwords do not match');
            }
            return true;
        })
];


// @route POST /api/auth/register
router.post('/register', [
    // Validation rules
    body('name', 'Name is required').notEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    body('role', 'Invalid role specified').optional().isIn(['reader', 'editor', 'admin']) // Optional, if not provided, model default takes over
], handleValidationErrors, registerUser); // Apply validation rules before controller

// @route POST /api/auth/login
router.post('/login', [
    // Validation rules
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty()
], handleValidationErrors, loginUser); // Apply validation rules before controller

// --- ADD NEW ROUTES ---
router.get('/me', protect, getMe); // Protect this route
router.put('/updatepassword', protect, updatePasswordValidationRules, handleValidationErrors, updatePassword); // Protect
// --- END NEW ROUTES ---

module.exports = router;