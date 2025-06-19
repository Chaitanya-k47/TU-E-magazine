// controllers/commentController.js
const Comment = require('../models/Comment');
<<<<<<< HEAD
const Article = require('../models/Article');
const asyncHandler = require('../middlewares/asyncHandler');
const { ErrorResponse } = require('../middlewares/errorMiddleware');
=======
const Article = require('../models/Article'); // To check if article exists
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

// @desc    Add a comment to an article
// @route   POST /api/articles/:articleId/comments
// @access  Private (Logged-in users)
<<<<<<< HEAD
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
=======
const addComment = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        // Check if article exists
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${articleId}` });
        }
        // Optional: Check if article is published before allowing comments
        // if (article.status !== 'Published') {
        //     return res.status(403).json({ success: false, message: 'Cannot comment on an unpublished article' });
        // }


        const commentData = {
            text,
            articleId,
            userId: req.user.id // From 'protect' middleware
        };

        const comment = await Comment.create(commentData);

        // Populate user details for the response
        const populatedComment = await Comment.findById(comment._id).populate('userId', 'name email');


        res.status(201).json({
            success: true,
            data: populatedComment
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        if (error.name === 'CastError' && error.path === '_id' && error.kind === 'ObjectId') { // For articleId
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.articleId}` });
        }
        res.status(500).json({ success: false, message: 'Server Error adding comment' });
    }
};
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

// @desc    Get all comments for an article
// @route   GET /api/articles/:articleId/comments
// @access  Public
<<<<<<< HEAD
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
=======
const getCommentsForArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;

        // Check if article exists
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${articleId}` });
        }
        // Optional: Check if article is published
        // if (article.status !== 'Published') {
        //      return res.status(403).json({ success: false, message: 'Cannot view comments for an unpublished article' });
        // }

        // Implement pagination for comments if needed
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20; // Default limit 20 comments
        const startIndex = (page - 1) * limit;

        const totalComments = await Comment.countDocuments({ articleId });

        const comments = await Comment.find({ articleId })
            .populate('userId', 'name email') // Populate author of the comment
            .sort({ createdAt: -1 }) // Newest comments first
            .skip(startIndex)
            .limit(limit);

        const pagination = {};
        if ((startIndex + comments.length) < totalComments) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }


        res.status(200).json({
            success: true,
            count: comments.length,
            totalCount: totalComments,
            pagination,
            data: comments
        });

    } catch (error) {
        console.error('Error getting comments:', error);
         if (error.name === 'CastError' && error.path === '_id' && error.kind === 'ObjectId') { // For articleId
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.articleId}` });
        }
        res.status(500).json({ success: false, message: 'Server Error getting comments' });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId  (or /api/articles/:articleId/comments/:commentId)
// @access  Private (Author of comment or Admin)
const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: `Comment not found with id ${commentId}` });
        }

        // Authorization: User must be admin or author of the comment
        const isAuthor = comment.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this comment' });
        }

        await Comment.deleteOne({ _id: commentId });

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: {}
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        if (error.name === 'CastError') {
             return res.status(404).json({ success: false, message: `Comment not found with id ${req.params.commentId}` });
        }
        res.status(500).json({ success: false, message: 'Server Error deleting comment' });
    }
};

>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

module.exports = {
    addComment,
    getCommentsForArticle,
    deleteComment
};