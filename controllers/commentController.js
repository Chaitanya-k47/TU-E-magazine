// controllers/commentController.js
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const asyncHandler = require('../middlewares/asyncHandler');
const { ErrorResponse } = require('../middlewares/errorMiddleware');

// @desc    Add a comment to an article
// @route   POST /api/articles/:articleId/comments
// @access  Private (Logged-in users)
const addComment = asyncHandler(async (req, res, next) => {
    const { articleId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
        return next(new ErrorResponse('Comment text is required', 400));
    }

    const article = await Article.findById(articleId);
    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${articleId}`, 404));
    }
    // ... (optional: check if article is published)

    const commentData = { text, articleId, userId: req.user.id };
    const newComment = await Comment.create(commentData);

    // --- INCREMENT commentCount on Article ---
    article.commentCount = (article.commentCount || 0) + 1;
    await article.save();
    // --- END INCREMENT ---

    const populatedComment = await Comment.findById(newComment._id).populate('userId', 'name email');
    res.status(201).json({ success: true, data: populatedComment });
});

// @desc    Get all comments for an article
// @route   GET /api/articles/:articleId/comments
// @access  Public
// @desc    Get all comments for an article
// @route   GET /api/articles/:articleId/comments
// @access  Public
const getCommentsForArticle = asyncHandler(async (req, res, next) => {
    const { articleId } = req.params;

    console.log('*** getCommentsForArticle - RAW req.query:', JSON.stringify(req.query));

    // --- EXPLICITLY PARSE PAGE AND LIMIT ---
    const currentPage = parseInt(req.query.commentPage, 10) || 1; // Use 'commentPage' from frontend query
    const itemsPerPage = parseInt(req.query.commentLimit, 10) || 5; // Use 'commentLimit' and default to 5
    // --- END PARSE ---

     console.log(`*** getCommentsForArticle - Parsed currentPage: ${currentPage}, itemsPerPage: ${itemsPerPage}`);

    // Validate articleId (already handled by express-validator in commentRoutes if param('articleId').isMongoId() is there)
    const article = await Article.findById(articleId);
    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${articleId}`, 404));
    }

    // Use the parsed numeric values for calculations
    const startIndex = (currentPage - 1) * itemsPerPage;
    console.log(`*** getCommentsForArticle - Calculated startIndex: ${startIndex}`); // DEBUG

    const totalComments = await Comment.countDocuments({ articleId });
    const comments = await Comment.find({ articleId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(itemsPerPage); // Use parsed itemsPerPage

    console.log('*** getCommentsForArticle - Fetched comment IDs:', comments.map(c => c._id));
        
    const pagination = {};
    // Check if there are more comments for the next page
    if ((startIndex + comments.length) < totalComments) {
        console.log(`Comments Backend: Current page type: ${typeof currentPage}, value: ${currentPage}`);
        console.log(`Comments Backend: Calculation for next page: currentPage + 1 = ${currentPage + 1}`);
        pagination.next = { page: currentPage + 1, limit: itemsPerPage }; // Use parsed numeric values
        console.log(`Comments Backend: pagination.next object:`, pagination.next);
    }
    // Check if there's a previous page
    if (currentPage > 1 && totalComments > 0) { // Ensure currentPage > 1
        pagination.prev = { page: currentPage - 1, limit: itemsPerPage }; // Use parsed numeric values
    }

    console.log('*** getCommentsForArticle - Responding with pagination:', JSON.stringify(pagination)); // Log pagination object

    res.status(200).json({
        success: true,
        count: comments.length,
        totalCount: totalComments,
        pagination,
        data: comments
    });
});


// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private (Author of comment or Admin)
const deleteComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
        return next(new ErrorResponse(`Comment not found with id ${commentId}`, 404));
    }

    // Authorization check (isAuthor or isAdmin)
    const isAuthor = comment.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
        return next(new ErrorResponse('User not authorized to delete this comment', 403));
    }

    const articleIdForComment = comment.articleId; // Get articleId before deleting comment

    await Comment.deleteOne({ _id: commentId });

    // --- DECREMENT commentCount on Article ---
    const article = await Article.findById(articleIdForComment);
    if (article) {
        article.commentCount = Math.max(0, (article.commentCount || 0) - 1); // Ensure it doesn't go below 0
        await article.save();
    } else {
        console.warn(`Could not find article ${articleIdForComment} to decrement comment count after deleting comment ${commentId}`);
    }
    // --- END DECREMENT ---

    res.status(200).json({ success: true, message: 'Comment deleted successfully', data: {} });
});

module.exports = {
    addComment,
    getCommentsForArticle,
    deleteComment
};