// routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
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

module.exports = router;