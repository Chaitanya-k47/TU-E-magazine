const Article = require('../models/Article');

// @desc    Create a new article
// @route   POST /api/articles
// @access  Public
const createArticle = async (req, res) => {
    try {
        const { title, content, category, tags, image } = req.body;

        const article = new Article({
            userId: req.user.id, // attach logged-in user's id
            title,
            content,
            category,
            tags,
            image
        });
        console.log('req.user:', req.user);
        await article.save();

        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: articles.length,
            data: articles
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createArticle,
    getArticles
};
