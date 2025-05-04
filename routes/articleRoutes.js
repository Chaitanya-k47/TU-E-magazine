const express = require('express');
const router = express.Router();
const { createArticle, getArticles } = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createArticle); // Protected ✅
router.get('/', getArticles); // Public

module.exports = router;