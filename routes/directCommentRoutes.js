// routes/directCommentRoutes.js (or simply comments.js if you prefer)
const express = require('express');
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// DELETE /api/comments/:commentId
router.delete('/:commentId', protect, deleteComment);

module.exports = router;