// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getPotentialAuthors
} = require('../controllers/userController');

const { body, param, validationResult } = require('express-validator'); // Import body, param
const { ErrorResponse } = require('../middlewares/errorMiddleware'); // To format errors

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorizeMiddleware');

// Middleware to handle validation results (can be shared or defined per route file)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return next(new ErrorResponse(errorMessages.join(', '), 400));
    }
    next();
};


// Apply protect and authorize middleware to all routes in this file
// Only authenticated ('protect') admins ('authorize('admin')') can access these
router.use(protect);
//router.use(authorize('admin'));

// --- Define routes ---

// POST /api/users (Create User)
const createUserValidationRules = [
    body('name', 'Name is required').notEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    body('role', 'Invalid role specified').optional().isIn(['reader', 'editor', 'admin'])
];

// PUT /api/users/:id (Update User)
const updateUserValidationRules = [
    param('id', 'User ID is invalid').isMongoId(), // Validate route parameter
    body('name', 'Name must be a string').optional().isString().trim().escape(),
    body('email', 'Please include a valid email').optional().isEmail().normalizeEmail(),
    body('role', 'Invalid role specified').optional().isIn(['reader', 'editor', 'admin'])
];

// GET /api/users/:id, PUT /api/users/:id, DELETE /api/users/:id
const userIdValidationRule = [
    param('id', 'User ID is invalid').isMongoId()
];


// --- NEW ROUTE for fetching potential authors (accessible by editor/admin) ---
router.get('/authors', authorize('admin', 'editor'), getPotentialAuthors);

// Admin-only routes
router.route('/')
    .get(authorize('admin'), getUsers)
    .post(authorize('admin'), createUserValidationRules, handleValidationErrors, createUser);

router.route('/:id')
    .get(authorize('admin'), userIdValidationRule, handleValidationErrors, getUserById)
    // For PUT, authorization is now handled inside the controller to allow self-update
    .put(updateUserValidationRules, handleValidationErrors, updateUser)
    .delete(authorize('admin'), userIdValidationRule, handleValidationErrors, deleteUser);

module.exports = router;