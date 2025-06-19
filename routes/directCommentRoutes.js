// routes/directCommentRoutes.js
const express = require('express');
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

const { param, validationResult } = require('express-validator');
const { ErrorResponse } = require('../middlewares/errorMiddleware');

const router = express.Router();

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
const commentIdValidation = [
    param('commentId', 'Comment ID is invalid').isMongoId()
];


// DELETE /api/comments/:commentId
router.delete(
    '/:commentId',
    protect,
    commentIdValidation,
    handleValidationErrors,
    deleteComment
);

module.exports = router;