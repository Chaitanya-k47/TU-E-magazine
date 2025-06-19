// routes/commentRoutes.js
const express = require('express');
const {
    addComment,
<<<<<<< HEAD
    getCommentsForArticle
    // deleteComment is handled by directCommentRoutes or can be added here too
} = require('../controllers/commentController');

const { body, param, query, validationResult } = require('express-validator');
const { ErrorResponse } = require('../middlewares/errorMiddleware');

const { protect } = require('../middlewares/authMiddleware');

// We'll merge params from article router to get :articleId
const router = express.Router({ mergeParams: true }); // mergeParams is important here

// Shared Validation Error Handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.msg} (in ${err.location || 'body'}${err.path ? '.'+err.path : ''})`);
        return next(new ErrorResponse(errorMessages.join('; '), 400));
    }
    next();
};

// --- Validation Rules ---

// Since articleId is a param from the parent router (articleRoutes),
// its validation (:articleId -> isMongoId()) should ideally happen there or be re-validated here.
// If articleRoutes already validates :id as MongoId for its own routes, mergeParams should make it available.
// For safety, or if not validated upstream, you can add:
const articleIdParamValidation = [
    param('articleId', 'Article ID in URL is invalid').isMongoId()
];

const addCommentValidationRules = [
    // articleIdParamValidation can be prepended here if not handled upstream
    body('text', 'Comment text is required').notEmpty().trim().escape()
];

const getCommentsQueryValidation = [
    // articleIdParamValidation can be prepended here
    query('page', 'Page number must be an integer greater than 0').optional().isInt({ min: 1 }).toInt(),
    query('limit', 'Limit must be an integer between 1 and 50').optional().isInt({ min: 1, max: 50 }).toInt()
];


// Route: /api/articles/:articleId/comments

// Note: articleId validation will primarily be handled by the articleIdValidation in articleRoutes.js for the base /:id
// If you want to be extra sure, or if the parent route doesn't validate its :id, you can add articleIdParamValidation here.
// However, if articleRoutes has `router.get('/:id', articleIdValidation, handleValidationErrors, getArticleById);`
// and you mount this as `articleRoutes.use('/:articleId/comments', commentRoutes);`, the `articleId` from the URL
// would have already been validated for the parent route. Let's assume the parent validates it.

router.route('/')
    .post(
        protect,
        addCommentValidationRules,
        handleValidationErrors,
        addComment
    )
    .get(
        // articleIdParamValidation, // Add this if you want to re-validate articleId specifically for this sub-route
        getCommentsQueryValidation,
        handleValidationErrors,
        getCommentsForArticle
    );

// If you want to handle DELETE /api/articles/:articleId/comments/:commentId here:
// const commentIdParamValidation = [
//     param('commentId', 'Comment ID in URL is invalid').isMongoId()
// ];
// router.delete(
//     '/:commentId',
//     protect,
//     // articleIdParamValidation, // if needed
//     commentIdParamValidation,
//     handleValidationErrors,
//     deleteComment // Assuming deleteComment is imported and handles its logic
// );

=======
    getCommentsForArticle,
    deleteComment
} = require('../controllers/commentController');

const { protect } = require('../middlewares/authMiddleware');
// const { authorize } = require('../middlewares/authorizeMiddleware'); // Not strictly needed here if auth is in controller

// We'll merge params from article router to get :articleId
const router = express.Router({ mergeParams: true });

// Route: /api/articles/:articleId/comments

router.route('/')
    .post(protect, addComment)          // Any logged-in user can comment
    .get(getCommentsForArticle);     // Publicly viewable comments

// Separate route for deleting a specific comment by its ID
// This route will be mounted at /api/comments/:commentId
// (Alternative: router.route('/:commentId').delete(protect, deleteComment); // For /api/articles/:articleId/comments/:commentId)
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

module.exports = router;