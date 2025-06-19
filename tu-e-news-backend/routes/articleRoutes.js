// routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
<<<<<<< HEAD
    getMyArticles,
    updateArticleStatus,
    likeArticle,
    translateArticle,
    approveCoAuthor
} = require('../controllers/articleController');
const mongoose = require('mongoose');

const { body, param, query, validationResult } = require('express-validator'); // Import query as well
const { ErrorResponse } = require('../middlewares/errorMiddleware');
const Article = require('../models/Article'); // Needed for category/status enum validation

// Import Middlewares
const optionalAuth = require('../middlewares/optionalAuth');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorizeMiddleware');
const normalizeBodyMiddleware = require('../middlewares/normalizeBodyMiddleware');

// Shared Validation Error Handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.msg} (in ${err.location || 'body'}${err.path ? '.'+err.path : ''})`);

        console.log('VALIDATION ERRORS:', errorMessages); // Log validation errors
        return next(new ErrorResponse(errorMessages.join('; '), 400));
    }
    next();
};

const { handleArticleUploads } = require('../middlewares/uploadMiddleware');

// --- Validation Rules ---

const articleIdValidation = [
     param('id', 'Article ID is invalid from articleIdValidation').isMongoId()
];

// --- VALIDATION FOR getMyArticles ---
const getMyArticlesQueryValidation = [
    query('page', 'Page number must be an integer greater than 0').optional().isInt({ min: 1 }).toInt(),
    query('limit', 'Limit for page must be an integer between 1 and 100').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status', 'Invalid status filter value').optional().isString().trim().escape()
        .custom((value) => {
            if (value && !Article.schema.path('status').enumValues.includes(value)) {
                throw new Error(`Status must be one of: ${Article.schema.path('status').enumValues.join(', ')}`);
            }
            return true;
        })
];

const createArticleValidationRules = [
    body('title', 'Title is required').notEmpty().trim(),
    body('content', 'Content is required').notEmpty().trim(),
    body('category', 'Category is required and must be a valid option')
        .notEmpty()
        .isIn(Article.schema.path('category').enumValues) // Validate against model enum
        .withMessage(`Invalid category. Allowed: ${Article.schema.path('category').enumValues.join(', ')}`),
    body('authorIds', 'Author IDs must be an array of valid User IDs')
        .optional() // Make it optional if you have default logic in controller
        .isArray()
        .custom((value) => { // Custom validator for array elements
            if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
                throw new Error('Each author ID in the array must be a valid MongoDB ObjectId');
            }
            return true;
        })    
    // body('imageUrl', 'Image URL must be a valid URL').optional({ checkFalsy: true }).isURL(), // checkFalsy treats "" as empty
    // For attachments, if it's an array of objects or strings, validation can be more complex.
    // Simple example if attachments is an array of strings (URLs):
    // body('attachments').optional().isArray(),
    // body('attachments.*.fileUrl', 'Attachment file URL must be a valid URL').optional({ checkFalsy: true }).isURL(),
    // body('attachments.*.fileName', 'Attachment file name must be a string').optional({ checkFalsy: true }).isString().trim().escape(),
];

const updateArticleValidationRules = [
    param('id', 'Article ID is invalid').isMongoId(),
    body('title', 'Title must be a string').optional().isString().trim(),
    body('content', 'Content must be a string').optional().isString().trim(),
    body('category', 'Category must be a valid option')
        .optional()
        .isIn(Article.schema.path('category').enumValues)
        .withMessage(`Invalid category. Allowed: ${Article.schema.path('category').enumValues.join(', ')}`),
    body('authorIds', 'Author IDs must be an array of valid User IDs')
        .optional() // If not provided, existing authors are kept
        .isArray()
        .custom((value) => {
            if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
                throw new Error('Each author ID in the array must be a valid MongoDB ObjectId');
            }
            return true;
        })
        .custom((value, { req }) => { // Ensure at least one author if array is provided
            if (req.body.authorIds !== undefined && Array.isArray(req.body.authorIds) && value.length === 0) {
            // This checks if 'authorIds' was explicitly sent in the body AND is an empty array
                throw new Error('Article must have at least one author if the authorIds field is provided and empty for update.');
            }
            return true;
        })    
];

// // --- TEMPORARILY SIMPLIFIED updateArticleValidationRules ---
// const updateArticleValidationRules = [
//     param('id', 'Article ID is invalid').isMongoId(),
//     // Keep only one simple 'body' validation to see if the error persists
//     body('title', 'Title must be a string if provided').optional().isString().trim()
//     // Comment out other body validations temporarily:
//     // body('content', ...).optional()...,
//     // body('category', ...).optional()...,
//     // body('authorIds', ...).optional()...,
// ];

const updateStatusValidationRules = [
    param('id', 'Article ID is invalid').isMongoId(),
    body('status', 'Status is required and must be a valid option')
        .notEmpty()
        .isIn(Article.schema.path('status').enumValues)
        .withMessage(`Invalid status. Allowed: ${Article.schema.path('status').enumValues.join(', ')}`)
];

const translateArticleValidationRules = [
    param('id', 'Article ID is invalid').isMongoId(),
    body('targetLanguage', 'Target language code is required (e.g., "es", "fr")')
        .notEmpty()
        .isString()
        .isLength({ min: 2, max: 5 }) // Common language code length
        .trim()
        .toLowerCase() // Normalize
];


const getArticlesQueryValidation = [
    query('category', 'Category filter must be a string').optional().isString().trim().escape(),
    query('authorId', 'Author ID filter must be a valid MongoDB ID').optional().isMongoId(),
    query('sortBy', 'SortBy parameter is invalid').optional().isString().trim().escape(), // More specific regex could be used
    query('page', 'Page number must be an integer greater than 0').optional().isInt({ min: 1 }).toInt(),
    query('limit', 'Limit must be an integer between 1 and 100').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search', 'Search term must be a string').optional().isString().trim().escape()
];

// --- DEBUGGING: Log all requests to this router ---
router.use((req, res, next) => {
    console.log(`*** REQUEST TO ARTICLE ROUTER: ${req.method} ${req.originalUrl}, Path: ${req.path} ***`);
    next();
});

// --- Route for Editors/Admins to get their own articles ---
router.get('/my-articles/all',
    (req, res, next) => {
        console.log('>>> HIT /my-articles/all ROUTE CHAIN (with actual controller) <<<');
        console.log('req.params for /my-articles/all:', req.params); // Should still be {}
        next();
    },
    protect,
    authorize('editor', 'admin'),
    getMyArticlesQueryValidation, // Ensure this is correctly defined and used
    handleValidationErrors,
    getMyArticles                 // RE-INTRODUCE THE ACTUAL CONTROLLER
);

// --- Public Routes ---
router.get('/', getArticlesQueryValidation, handleValidationErrors, getArticles);
router.get('/:id',
    (req, res, next) => { // DEBUGGING MIDDLEWARE
        console.log(`>>> HIT /:id ROUTE HANDLER CHAIN with id: ${req.params.id} <<<`);
        next();
    },
    optionalAuth,
    articleIdValidation, // This contains param('id').isMongoId()
    handleValidationErrors,
    getArticleById
);

// --- Protected Routes ---

// --- NEW ROUTE: Co-author approves an article ---
// This should be a PUT request as it modifies the article resource's state.
// Place it before generic /:id PUT if needed, but method difference should be enough.
router.put('/:id/approve-coauthor',
    protect, // User must be logged in
    // No specific role authorization here, controller checks if user is an author
    articleIdValidation, // Validate that :id is a MongoId
    handleValidationErrors,
    approveCoAuthor
);
// --- END NEW ROUTE ---


router.post('/',
    protect,
    authorize('admin', 'editor'),
    handleArticleUploads, // Apply multer middleware BEFORE validation rules that might depend on req.body
    createArticleValidationRules, // Keep your other validations
    handleValidationErrors,
    createArticle
);

router.put('/:id',
    protect,
    handleArticleUploads, // Apply multer middleware
    normalizeBodyMiddleware,
    updateArticleValidationRules,
    handleValidationErrors,
    updateArticle
);

router.delete('/:id', protect, articleIdValidation, handleValidationErrors, deleteArticle); // Only ID validation needed for delete
router.put('/:id/status', protect, authorize('admin'), updateStatusValidationRules, handleValidationErrors, updateArticleStatus);
router.put('/:id/like', protect, articleIdValidation, handleValidationErrors, likeArticle); // Only ID validation for like
router.post('/:id/translate', protect, //authorize('admin', 'editor'),
 translateArticleValidationRules, handleValidationErrors, translateArticle);


// --- Admin-Specific Article Management (Status Update) ---
// updateArticleStatus validation and controller are already there
router.put('/:id/status', protect, authorize('admin'), updateStatusValidationRules, handleValidationErrors, /* controller.updateArticleStatus */);

// Mounting comment routes is typically done in app.js or the parent router file.
// If you have: articleRoutes.use('/:articleId/comments', commentRoutes);
// then ensure that commentRoutes handles its own param validation for :articleId if needed,
// or that it inherits it if mergeParams: true is used in commentRoutes.
=======
    updateArticleStatus,
    likeArticle,
    translateArticle
} = require('../controllers/articleController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorizeMiddleware');

// --- Public Routes ---
router.get('/', getArticles);
router.get('/:id', getArticleById);

// --- Protected Routes ---
router.post('/', protect, authorize('admin', 'editor'), createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);
router.put('/:id/status', protect, authorize('admin'), updateArticleStatus);
router.put('/:id/like', protect, likeArticle);
router.post('/:id/translate', protect, authorize('admin', 'editor'), translateArticle);


// Add routes for Comments, Translation later
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

module.exports = router;