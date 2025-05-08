// routes/commentRoutes.js
const express = require('express');
const {
    addComment,
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

module.exports = router;