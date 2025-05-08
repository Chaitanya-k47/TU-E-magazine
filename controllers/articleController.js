// controllers/articleController.js
const Article = require('../models/Article');
const User = require('../models/User'); // Needed for populating author info

// Error handling utility (optional but recommended)
// const asyncHandler = require('../middleware/asyncHandler'); // If you create an asyncHandler middleware
// const ErrorResponse = require('../utils/errorResponse'); // If you create a custom error class

// --- Placeholder Services (simulate external API calls) ---
const PlagiarismService = {
    check: async (text) => {
        console.log('[PlagiarismService STUB] Checking text for plagiarism...');
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

        // Simulate different outcomes
        const random = Math.random();
        if (random < 0.1) { // 10% chance of failure
            console.log('[PlagiarismService STUB] Check failed.');
            throw new Error('Plagiarism check API unavailable');
        } else if (random < 0.3) { // 20% chance of flagging (after failure chance)
            const score = Math.floor(Math.random() * 50) + 50; // Score between 50-99%
            console.log(`[PlagiarismService STUB] Plagiarism detected: ${score}%`);
            return { isFlagged: true, score: score, reportUrl: 'http://fakeplagiarism.com/report/123' };
        } else {
            const score = Math.floor(Math.random() * 20); // Score between 0-19%
            console.log(`[PlagiarismService STUB] Plagiarism check OK: ${score}%`);
            return { isFlagged: false, score: score, reportUrl: null };
        }
    }
};

const TranslationService = {
    translate: async (text, targetLanguage) => {
        console.log(`[TranslationService STUB] Translating text to ${targetLanguage}...`);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay

        const random = Math.random();
        if (random < 0.1) { // 10% chance of failure
             console.log('[TranslationService STUB] Translation failed.');
            throw new Error('Translation service API unavailable');
        }

        // Simulate translation
        const translatedText = `[${targetLanguage.toUpperCase()}] Translated: ${text.substring(0, 50)}... (stub)`;
        console.log(`[TranslationService STUB] Translation successful for ${targetLanguage}.`);
        return translatedText;
    }
};
// --- End Placeholder Services ---


// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Admin, Editor)
const createArticle = async (req, res, next) => {
    try {
        const { title, content, category, imageUrl, attachments } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({ success: false, message: 'Please provide title, content, and category' });
        }

        const articleData = {
            userId: req.user.id,
            title,
            content,
            category,
            imageUrl: imageUrl || undefined,
            attachments: attachments || undefined,
            status: 'Draft', // Default status
            plagiarismStatus: 'Not Checked', // Initial plagiarism status
        };

        // --- Plagiarism Check Integration STUB ---
        try {
            console.log('Initiating plagiarism check for new article...');
            const plagiarismResult = await PlagiarismService.check(content);
            if (plagiarismResult.isFlagged) {
                articleData.plagiarismStatus = 'Checked - Flagged';
                // Business logic: For example, keep as draft and notify, or auto-reject if severe.
                // For now, we'll just set the status. Admin will review.
                console.warn(`Article content flagged for plagiarism: ${plagiarismResult.score}%`);
            } else {
                articleData.plagiarismStatus = 'Checked - OK';
            }
        } catch (plagError) {
           console.error('Plagiarism check service failed:', plagError.message);
           articleData.plagiarismStatus = 'Check Failed';
           // Decide if you want to block saving or allow saving with 'Check Failed' status
        }
        // --- End Plagiarism Check Integration STUB ---

        const article = await Article.create(articleData);

        res.status(201).json({
            success: true,
            data: article
        });

    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ success: false, message: 'Server Error creating article' });
    }
};


// @desc    Get all PUBLISHED articles with filtering, sorting, pagination
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res, next) => {
    try {
        let query;

        // Base query: Only fetch published articles for the public view
        const baseQuery = { status: 'Published' };

        // --- Filtering ---
        let filters = { ...baseQuery };
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.authorId) {
            filters.userId = req.query.authorId; // Filter by author's User ID
        }
        // Add more filters as needed (e.g., tags if you add them)

        query = Article.find(filters);

        // --- Sorting ---
        // Default sort: newest published first (using createdAt for now)
        // Consider adding a `publishedAt` field later for more accuracy
        let sortBy = '-createdAt'; // Descending createdAt
        if (req.query.sortBy) {
             // Example: ?sortBy=title:asc,createdAt:desc -> 'title -createdAt'
            const sortParts = req.query.sortBy.split(',');
            sortBy = sortParts.map(part => {
                const [field, order] = part.split(':');
                return (order === 'desc' ? '-' : '') + field;
            }).join(' ');
        }
        query = query.sort(sortBy);

        // --- Pagination ---
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Default limit 10 per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Article.countDocuments(filters); // Count matching documents

        query = query.skip(startIndex).limit(limit);

        // --- Populate Author Info ---
        // Select only necessary user fields to avoid exposing sensitive data
        query = query.populate('userId', 'name email'); // Populate name and email from User model

        // Execute query
        const articles = await query;

        // --- Pagination Result ---
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: articles.length,
            totalCount: total, // Total matching articles
            pagination,
            data: articles
        });

    } catch (error) {
        console.error('Error getting articles:', error);
        res.status(500).json({ success: false, message: 'Server Error getting articles' });
        // next(error);
    }
};


// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public (for Published) / Private (for Authors/Admins)
const getArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id)
                                     .populate('userId', 'name email'); // Populate author details

        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
            // return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
        }

        // --- Access Control ---
        // Public users can only see 'Published' articles
        // Logged-in users might see their own drafts/pending or Admin sees all (implement later if needed)
        if (article.status !== 'Published') {
             // For now, only show published articles via this public route
             // More complex logic needed if authors/admins should see unpublished via this route
             // Check if user is logged in and is author or admin
             // if (!req.user || (req.user.role !== 'admin' && article.userId._id.toString() !== req.user.id)) {
                 return res.status(403).json({ success: false, message: 'Article is not published' });
                 // Or potentially 404 to obscure existence:
                 // return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
             // }
        }

        res.status(200).json({
            success: true,
            data: article
        });

    } catch (error) {
        console.error(`Error getting article ${req.params.id}:`, error);
        // Handle CastError specifically if ID format is invalid
        if (error.name === 'CastError') {
             return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
            // return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
        }
        res.status(500).json({ success: false, message: 'Server Error getting article' });
        // next(error);
    }
};

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private (Admin or Author of the article)
const updateArticle = async (req, res, next) => {
    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
        }

        const isAuthor = article.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ success: false, message: 'User not authorized to update this article' });
        }

        const { title, content, category, imageUrl, attachments } = req.body;
        const fieldsToUpdate = {};
        let contentChanged = false;

        if (title !== undefined) fieldsToUpdate.title = title;
        if (content !== undefined) {
            if (article.content !== content) { // Check if content actually changed
                fieldsToUpdate.content = content;
                contentChanged = true;
            }
        }
        if (category !== undefined) fieldsToUpdate.category = category;
        if (imageUrl !== undefined) fieldsToUpdate.imageUrl = imageUrl;
        if (attachments !== undefined) fieldsToUpdate.attachments = attachments;

        // --- Plagiarism Check on Update STUB (if content changed) ---
        if (contentChanged) {
            fieldsToUpdate.plagiarismStatus = 'Not Checked'; // Reset status before re-checking
            try {
                console.log('Initiating plagiarism check for updated article content...');
                const plagiarismResult = await PlagiarismService.check(fieldsToUpdate.content);
                if (plagiarismResult.isFlagged) {
                    fieldsToUpdate.plagiarismStatus = 'Checked - Flagged';
                    console.warn(`Updated article content flagged for plagiarism: ${plagiarismResult.score}%`);
                } else {
                    fieldsToUpdate.plagiarismStatus = 'Checked - OK';
                }
            } catch (plagError) {
               console.error('Plagiarism check service failed on update:', plagError.message);
               fieldsToUpdate.plagiarismStatus = 'Check Failed';
            }
        }
        // --- End Plagiarism Check on Update STUB ---

        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, { $set: fieldsToUpdate }, {
            new: true,
            runValidators: true
        }).populate('userId', 'name email');

        res.status(200).json({
            success: true,
            data: updatedArticle
        });

    } catch (error) {
        console.error(`Error updating article ${req.params.id}:`, error);
        if (error.name === 'CastError') {
             return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
        }
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server Error updating article' });
    }
};

// @desc    Translate an article to a target language
// @route   POST /api/articles/:id/translate
// @access  Private (e.g., Admin, Editor - decide based on requirements)
const translateArticle = async (req, res, next) => {
    try {
        const { targetLanguage } = req.body; // e.g., 'es', 'fr', 'hi'

        if (!targetLanguage) {
            return res.status(400).json({ success: false, message: 'Target language is required (e.g., "es", "fr").' });
        }

        let article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
        }

        // --- Authorization (Example: Admin or author can translate) ---
        // const isAuthor = article.userId.toString() === req.user.id;
        // const isAdmin = req.user.role === 'admin';
        // if (!isAuthor && !isAdmin) {
        //     return res.status(403).json({ success: false, message: 'User not authorized to translate this article' });
        // }
        // For now, let's assume route-level auth (e.g. protect + authorize('admin','editor')) handles this

        // Check if original content exists
        if (!article.content) {
             return res.status(400).json({ success: false, message: 'Article has no content to translate.' });
        }

        // --- Translation Service STUB ---
        try {
            console.log(`Attempting to translate article ${article._id} to ${targetLanguage}...`);
            const translatedText = await TranslationService.translate(article.content, targetLanguage);

            // Ensure translatedContent map exists
            if (!article.translatedContent) {
                article.translatedContent = new Map();
            }
            article.translatedContent.set(targetLanguage, translatedText);
            
            await article.save();

            res.status(200).json({
                success: true,
                message: `Article translated to ${targetLanguage} successfully (STUB).`,
                data: {
                    articleId: article._id,
                    language: targetLanguage,
                    translatedText: article.translatedContent.get(targetLanguage)
                }
            });

        } catch (transError) {
            console.error(`Translation service failed for article ${article._id} to ${targetLanguage}:`, transError.message);
            // Potentially store a 'Translation Failed' status if needed
            res.status(500).json({ success: false, message: `Translation to ${targetLanguage} failed: ${transError.message}` });
        }
        // --- End Translation Service STUB ---

    } catch (error) {
        console.error(`Error in translateArticle controller for article ${req.params.id}:`, error);
        if (error.name === 'CastError') {
             return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
        }
        res.status(500).json({ success: false, message: 'Server Error translating article' });
    }
};


// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private (Admin or Author of the article)
const deleteArticle = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
            // return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
        }

        // --- Authorization Check ---
        const isAuthor = article.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this article' });
            // return next(new ErrorResponse('User not authorized to delete this article', 403));
        }

        await Article.deleteOne({ _id: req.params.id }); // Use deleteOne

        res.status(200).json({
            success: true,
            message: 'Article deleted successfully',
            data: {} // Often good practice to return empty object on delete
        });

    } catch (error) {
        console.error(`Error deleting article ${req.params.id}:`, error);
        if (error.name === 'CastError') {
             return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
            // return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
        }
        res.status(500).json({ success: false, message: 'Server Error deleting article' });
        // next(error);
    }
};


// @desc    Update article status (e.g., Publish, Reject)
// @route   PUT /api/articles/:id/status
// @access  Private (Admin only)
const updateArticleStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        // Validate the provided status
        const allowedStatuses = Article.schema.path('status').enumValues;
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status provided. Must be one of: ${allowedStatuses.join(', ')}`
            });
            // return next(new ErrorResponse(`Invalid status: ${status}`, 400));
        }

        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
            // return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
        }

        // --- Authorization is handled by 'authorize('admin')' middleware in the route ---

        // Update only the status
        // Consider adding a 'publishedAt' timestamp field if status === 'Published'
        article.status = status;

        // If publishing, maybe reset plagiarism check if previously flagged? Or require re-check? (Business Logic)
        // if (status === 'Published' && article.plagiarismStatus === 'Checked - Flagged') {
            // Decide action - e.g., block publishing or reset status
            // return res.status(400).json({ success: false, message: 'Cannot publish flagged article without review/edit.' });
        // }

        await article.save(); // Use save to trigger potential middleware/hooks if added later

        res.status(200).json({
            success: true,
            data: article // Return the updated article
        });

    } catch (error) {
        console.error(`Error updating status for article ${req.params.id}:`, error);
         if (error.name === 'CastError') {
             return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
            // return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
        }
        res.status(500).json({ success: false, message: 'Server Error updating article status' });
        // next(error);
    }
};

// @desc    Like an article
// @route   PUT /api/articles/:id/like
// @access  Private (Logged-in users)
const likeArticle = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
        }

        // Simplistic like: increment count.
        // For a real app, you'd want to track which users liked to prevent multiple likes by the same user.
        // This would involve adding a 'likedBy' array to the Article model or a separate 'Likes' collection.
        // Example of tracking unique likes (if you had a likedBy array):
        // if (article.likedBy.includes(req.user.id)) {
        //     return res.status(400).json({ success: false, message: 'Article already liked by this user' });
        // }
        // article.likedBy.push(req.user.id);
        // article.likes = article.likedBy.length;

        // Current simple increment:
        article.likes = (article.likes || 0) + 1;
        await article.save();

        res.status(200).json({
            success: true,
            message: 'Article liked successfully',
            data: { likes: article.likes }
        });

    } catch (error) {
        console.error(`Error liking article ${req.params.id}:`, error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: `Article not found with id ${req.params.id}` });
        }
        res.status(500).json({ success: false, message: 'Server Error liking article' });
    }
};


// --- Update the exports at the bottom ---
module.exports = {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,       
    deleteArticle,       
    updateArticleStatus,
    likeArticle,
    translateArticle  
};
