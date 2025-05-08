// controllers/commentController.js
const Comment = require('../models/Comment');
const Article = require('../models/Article'); // To check if article exists

// @desc    Add a comment to an article
// @route   POST /api/articles/:articleId/comments
// @access  Private (Logged-in users)
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

// @desc    Get all comments for an article
// @route   GET /api/articles/:articleId/comments
// @access  Public
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


module.exports = {
    addComment,
    getCommentsForArticle,
    deleteComment
};