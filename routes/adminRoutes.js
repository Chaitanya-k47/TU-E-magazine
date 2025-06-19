// TU-E-NEWS-BACKEND/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { getAdminAllArticles /* , any other admin-specific article controllers */ } = require('../controllers/articleController');
// const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController'); // User management is already in userRoutes

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorizeMiddleware');

// Middleware to handle validation results (if you add query validation for admin routes)
const { validationResult } = require('express-validator');
const { ErrorResponse } = require('../middlewares/errorMiddleware');
const handleValidationErrors = (req, res, next) => { /* ... (same as in other route files) ... */ };


// Protect all routes in this file with admin role
router.use(protect);
router.use(authorize('admin')); // All routes below this require admin role

// --- Admin Article Management ---
// Example query validation for admin article fetching
const getAdminArticlesQueryValidation = [
    // query('status')...
    // query('category')...
    // query('authorId')...
    // query('page')...
    // query('limit')...
];

router.get('/articles',
    // getAdminArticlesQueryValidation, // Add validation if needed
    // handleValidationErrors,
    getAdminAllArticles
);

// Other admin-specific article routes could go here, e.g., bulk actions

// User Management routes are typically in their own userRoutes.js and already admin-protected.
// If you needed specific admin-only variations of user routes, they could be here.

module.exports = router;