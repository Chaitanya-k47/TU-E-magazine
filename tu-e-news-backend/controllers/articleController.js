// controllers/articleController.js
const Article = require('../models/Article');
<<<<<<< HEAD
const Comment = require('../models/Comment');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const { ErrorResponse } = require('../middlewares/errorMiddleware');
const fs = require('fs'); // File system module for file operations
const path = require('path'); // Path module for path manipulation
const mongoose = require('mongoose');

const isUserAuthorizedForArticle = (article, user) => {
    if (!user) return false; // No user, not authorized
    if (user.role === 'admin') return true; // Admin is always authorized
    // Ensure article.userIds exists and is an array before calling .some
    if (article.userIds && Array.isArray(article.userIds) && article.userIds.some(authorId => authorId.toString() === user.id)) {
        return true; // User is one of the authors
    }
    return false;
};

// --- Placeholder Services (Keep as is or ensure they are correctly defined) ---
const PlagiarismService = {
    check: async (text) => {
        console.log('[PlagiarismService STUB] Checking text for plagiarism...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const random = Math.random();
        let result = {
            isFlagged: false,
            score: 0, // Default score
            status: 'Checked - OK', // Default status
            reportUrl: null // Optional
        };

        if (random < 0.1) {
            console.log('[PlagiarismService STUB] Check failed.');
            // throw new Error('Plagiarism check API unavailable'); // Or handle as 'Check Failed'
            result.status = 'Check Failed';
            result.score = null; // Or keep as 0
        } else if (random < 0.4) { // Increased chance of flagging for demo (e.g., 30% after fail)
            result.isFlagged = true;
            result.score = Math.floor(Math.random() * 70) + 30; // Score between 30-99% for flagged
            result.status = 'Checked - Flagged';
            console.log(`[PlagiarismService STUB] Plagiarism detected: ${result.score}%`);
            result.reportUrl = 'http://fakeplagiarism.com/report/stub123';
        } else {
            result.score = Math.floor(Math.random() * 29); // Score between 0-29% for OK
            result.status = 'Checked - OK';
            console.log(`[PlagiarismService STUB] Plagiarism check OK: ${result.score}%`);
        }
        return result; // Return an object with status and score
=======
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
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
    }
};

const TranslationService = {
    translate: async (text, targetLanguage) => {
        console.log(`[TranslationService STUB] Translating text to ${targetLanguage}...`);
<<<<<<< HEAD
        await new Promise(resolve => setTimeout(resolve, 1500));
        const random = Math.random();
        if (random < 0.1) {
            console.log('[TranslationService STUB] Translation failed.');
            throw new Error('Translation service API unavailable');
        }
=======
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay

        const random = Math.random();
        if (random < 0.1) { // 10% chance of failure
             console.log('[TranslationService STUB] Translation failed.');
            throw new Error('Translation service API unavailable');
        }

        // Simulate translation
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
        const translatedText = `[${targetLanguage.toUpperCase()}] Translated: ${text.substring(0, 50)}... (stub)`;
        console.log(`[TranslationService STUB] Translation successful for ${targetLanguage}.`);
        return translatedText;
    }
};
// --- End Placeholder Services ---

<<<<<<< HEAD
// Helper function to safely delete a file
const deleteUploadedFile = (filePathFromMulter) => {
    // filePathFromMulter is the absolute path provided by multer (e.g., req.files.imageUrl[0].path)
    if (filePathFromMulter) {
        try {
            if (fs.existsSync(filePathFromMulter)) {
                fs.unlinkSync(filePathFromMulter);
                console.log(`Successfully deleted uploaded file: ${filePathFromMulter}`);
            } else {
                console.warn(`Uploaded file not found, cannot delete: ${filePathFromMulter}`);
            }
        } catch (err) {
            console.error(`Error deleting uploaded file ${filePathFromMulter}:`, err);
        }
    }
};

// Helper function to delete a file based on its stored URL (e.g., /uploads/filename.jpg)
const deleteFileByUrl = (fileUrl) => {
    if (fileUrl && typeof fileUrl === 'string') {
        // Construct absolute path from the URL assuming it starts with /uploads/
        // and 'public' is the static root.
        const filePath = path.join(__dirname, '../public', fileUrl); // Adjust if your static path is different
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Successfully deleted file by URL: ${filePath}`);
            } else {
                console.warn(`File by URL not found, cannot delete: ${filePath}`);
            }
        } catch (err) {
            console.error(`Error deleting file by URL ${filePath}:`, err);
        }
    }
};

=======
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Admin, Editor)
<<<<<<< HEAD
const createArticle = asyncHandler(async (req, res, next) => {
    // Non-file fields from req.body (populated by multer)
    const { title, content, category, authorIds } = req.body; // Expect authorIds as an array
    // File fields from req.files (populated by multer)
    const files = req.files;
    const currentUser = req.user;

    // Validations for title, content, category, authorIds handled by express-validator

    let effectiveAuthorIds = [];
    if (authorIds && Array.isArray(authorIds) && authorIds.length > 0) {
         effectiveAuthorIds = [...new Set(authorIds.map(id => id.toString()))]; // Ensure unique string IDs
    }

    // Ensure the creator is an author
    if (!effectiveAuthorIds.includes(currentUser.id.toString())) {
        effectiveAuthorIds.push(currentUser.id.toString());
    }

    // Ensure there's at least one author (which will be the current user if none else provided)
    if (effectiveAuthorIds.length === 0) {
         effectiveAuthorIds.push(currentUser.id.toString());
    }


    // --- NEW: Fetch author names and prepare authorNamesText ---
    let authorNamesString = '';
    if (effectiveAuthorIds.length > 0) {
        try {
            const validObjectIds = effectiveAuthorIds
                .filter(id => mongoose.Types.ObjectId.isValid(id))
                .map(id => new mongoose.Types.ObjectId(id));
            if (validObjectIds.length > 0) {
                const authors = await User.find({ '_id': { $in: validObjectIds } }).select('name');
                authorNamesString = authors.map(author => author.name).join(' ').trim();
            }
        } catch (error) {
            console.error("Error fetching author names for new article:", error);
        }
    }
    // --- END NEW ---

    // --- WORKFLOW LOGIC FOR NEW ARTICLE ---
    let initialStatus = 'Draft'; // Default to Draft if only one author (the creator)
    let pendingApprovalsList = [];

    if (effectiveAuthorIds.length > 1) {
        initialStatus = 'Pending Approval';
        // All authors except the creator need to approve
        pendingApprovalsList = effectiveAuthorIds
            .filter(authorId => authorId !== currentUser.id.toString())
            .map(authorId => ({ userId: authorId, approved: false }));
    }
    // If only one author (the creator), it could go to 'Pending Admin Review' directly,
    // or stay 'Draft'. Let's keep it 'Draft' and they can "submit" it which changes to 'Pending Admin Review'.
    // Or, if initialStatus is 'Draft' and there's only one author, pendingApprovalsList remains empty.

    const articleData = {
        userIds: effectiveAuthorIds,
        title,
        content,
        category,
        authorNamesText: authorNamesString,
        status: initialStatus, // Set based on number of authors
        pendingApprovals: pendingApprovalsList,
        lastEditedBy: currentUser.id,
        version: 1, // Initial version
        // Default plagiarismStatus & score will be set by the schema or plagiarism checkma
    };

    // Handle imageUrl
    if (files && files.imageUrl && files.imageUrl.length > 0) {
        articleData.imageUrl = `/uploads/${files.imageUrl[0].filename}`;
    }

    // Handle attachments
    if (files && files.attachments && files.attachments.length > 0) {
        articleData.attachments = files.attachments.map(file => ({
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype
        }));
    }

    // --- Plagiarism Check Integration STUB ---
    try {
    console.log('Initiating plagiarism check...');
    const plagiarismResult = await PlagiarismService.check(content); // Use contentToTest
    articleData.plagiarismStatus = plagiarismResult.status;
    articleData.plagiarismScore = plagiarismResult.score; // Assign the score
    if (plagiarismResult.isFlagged) {
        console.warn(`Content flagged for plagiarism: ${plagiarismResult.score}%`);
    }
    } catch (plagError) {
   console.error('Plagiarism check service failed:', plagError.message);
   articleData.plagiarismStatus = 'Check Failed';
   articleData.plagiarismScore = null;
    }
    // --- End Plagiarism Check ---

    const article = await Article.create(articleData);
    const populatedArticle = await Article.findById(article._id)
        .populate('userIds', 'name email')
        .populate('pendingApprovals.userId', 'name email') // Also populate users in pendingApprovals
        .populate('lastEditedBy', 'name email');
        
    res.status(201).json({ success: true, data: populatedArticle || article });
});

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private (Admin or Author of the article)
const updateArticle = asyncHandler(async (req, res, next) => {
    
    console.log('--- BACKEND updateArticle Controller HIT ---');
    console.log('req.params.id:', req.params.id);
    console.log('>>>> req.body (from multer for text fields):', JSON.stringify(req.body, null, 2));
    console.log('>>>> req.files (from multer for files):', req.files);
    
    const articleId = req.params.id;
    const { title, content, category, authorIds, clearAllAttachments, existingAttachmentUrlsToKeep } = req.body; // Destructure all expected body fields
    const files = req.files;
    const currentUser = req.user;

    let article = await Article.findById(articleId);
    if (!article) {
        if (files) {
            if (files.imageUrl) deleteUploadedFile(files.imageUrl[0].path);
            if (files.attachments) files.attachments.forEach(f => deleteUploadedFile(f.path));
        }
        return next(new ErrorResponse(`Article not found with id ${articleId}`, 404));
    }

    if (!isUserAuthorizedForArticle(article, currentUser)) {
        if (files) {
            if (files.imageUrl) deleteUploadedFile(files.imageUrl[0].path);
            if (files.attachments) files.attachments.forEach(f => deleteUploadedFile(f.path));
        }
        return next(new ErrorResponse('User not authorized to update this article', 403));
    }

    const fieldsToUpdate = {};
    let contentChangedOrSignificantFieldChanged = false;
    const originalStatus = article.status; // Capture status BEFORE any modifications
    const originalVersion = article.version || 1;

    // Check for changes in text fields
    if (req.body.hasOwnProperty('title') && article.title !== title) {
        fieldsToUpdate.title = title;
        contentChangedOrSignificantFieldChanged = true;
    }
    if (req.body.hasOwnProperty('content') && article.content !== content) {
        fieldsToUpdate.content = content;
        contentChangedOrSignificantFieldChanged = true;
    }
    if (req.body.hasOwnProperty('category') && article.category !== category) {
        fieldsToUpdate.category = category;
        contentChangedOrSignificantFieldChanged = true;
    }
    // --- MODIFIED: Handle authorIds update AND authorNamesText ---
    let newAuthorIdStrings = article.userIds.map(idObj => idObj.toString()); // Start with current authors

    if (req.body.hasOwnProperty('authorIds')) {
        const proposedAuthorIds = Array.isArray(authorIds) ? [...new Set(authorIds.map(id => id.toString()))].sort() : [];
        const currentAuthorIdStringsSorted = article.userIds.map(idObj => idObj.toString()).sort();
        if (JSON.stringify(proposedAuthorIds) !== JSON.stringify(currentAuthorIdStringsSorted)) {
            if (proposedAuthorIds.length === 0) return next(new ErrorResponse('Article must have at least one author.', 400));
            fieldsToUpdate.userIds = proposedAuthorIds;
            newAuthorIdStrings = proposedAuthorIds; // Update for authorNamesText calculation
            contentChangedOrSignificantFieldChanged = true;
        }
    }
    // If authorIds changed, re-calculate authorNamesText
    if (fieldsToUpdate.hasOwnProperty('userIds') || (req.body.hasOwnProperty('authorIds') && contentChangedOrSignificantFieldChanged) ) { // Second part for when list changes but is a subset.
        let authorNamesStr = '';
        if (newAuthorIdStrings.length > 0) {
            try {
                    const validObjectIds = newAuthorIdStrings.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
                    if (validObjectIds.length > 0) {
                        const authors = await User.find({ '_id': { $in: validObjectIds } }).select('name');
                        authorNamesString = authors.map(author => author.name).join(' ').trim();
                    }
                } catch (error) { console.error("Error fetching author names for article update:", error); }
        }
        fieldsToUpdate.authorNamesText = authorNamesStr;
    }
    // --- END MODIFIED ---

    // If content is being updated, it's a significant change and translations are invalid
    if (req.body.hasOwnProperty('content') && article.content !== req.body.content) {
        fieldsToUpdate.content = req.body.content;
        contentChangedOrSignificantFieldChanged = true;
        fieldsToUpdate.translatedContent = new Map(); // CLEAR existing translations
        console.log(`Content changed for article ${articleId}, clearing translations.`);
    }

    // Handle imageUrl update
    if (files && files.imageUrl && files.imageUrl.length > 0) {
        const newImageUrlPath = `/uploads/${files.imageUrl[0].filename}`;
        if (article.imageUrl && article.imageUrl !== newImageUrlPath) { // Only delete if old image exists and is different
            deleteFileByUrl(article.imageUrl);
        }
        fieldsToUpdate.imageUrl = newImageUrlPath;
        contentChangedOrSignificantFieldChanged = true; // <<< CORRECT: Set flag
    } else if (req.body.hasOwnProperty('imageUrl') && req.body.imageUrl === '' && article.imageUrl) {
        // Explicit signal to delete existing image (and no new one uploaded)
        deleteFileByUrl(article.imageUrl);
        fieldsToUpdate.imageUrl = '';
        contentChangedOrSignificantFieldChanged = true; // <<< CORRECT: Set flag
    }

    // Handle attachments update
    if (files && files.attachments && files.attachments.length > 0) {
        // New attachments were uploaded, replace ALL existing ones
        console.log('New attachments received, replacing all.');
        if (article.attachments && article.attachments.length > 0) {
            article.attachments.forEach(att => deleteFileByUrl(att.fileUrl));
        }
        fieldsToUpdate.attachments = files.attachments.map(file => ({
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype
        }));
        contentChangedOrSignificantFieldChanged = true; // <<< CORRECT: Set flag
    } else if (clearAllAttachments === 'true') {
        // Signal to clear all existing attachments and no new ones were uploaded
        console.log('Clearing all existing attachments based on flag.');
        if (article.attachments && article.attachments.length > 0) {
            article.attachments.forEach(att => deleteFileByUrl(att.fileUrl));
            contentChangedOrSignificantFieldChanged = true; // <<< CORRECT: Set flag (if there were attachments to clear)
        }
        fieldsToUpdate.attachments = [];
    } else if (existingAttachmentUrlsToKeep !== undefined) {
        const urlsToKeep = Array.isArray(existingAttachmentUrlsToKeep) ? existingAttachmentUrlsToKeep : [existingAttachmentUrlsToKeep].filter(Boolean); // Ensure it's an array, filter out null/undefined from single element array
        console.log('Attempting to keep specific existing attachments:', urlsToKeep);

        const newAttachmentList = [];
        let attachmentsActuallyChanged = false;
        const originalAttachmentCount = article.attachments ? article.attachments.length : 0;

        if (article.attachments && article.attachments.length > 0) {
            article.attachments.forEach(existingAtt => {
                if (urlsToKeep.includes(existingAtt.fileUrl)) {
                    newAttachmentList.push(existingAtt);
                } else {
                    deleteFileByUrl(existingAtt.fileUrl);
                    attachmentsActuallyChanged = true;
                }
            });
        }
        // If the number of attachments changed, it's a significant change
        if (originalAttachmentCount !== newAttachmentList.length || attachmentsActuallyChanged) {
            contentChangedOrSignificantFieldChanged = true; // <<< CORRECT: Set flag
        }
        fieldsToUpdate.attachments = newAttachmentList;
    }
    // If none of the above attachment conditions are met, fieldsToUpdate.attachments remains unset, meaning no change to attachments.

    // To clear on any significant change:
    if (contentChangedOrSignificantFieldChanged && article.translatedContent && article.translatedContent.size > 0) {
       fieldsToUpdate.translatedContent = new Map();
    }

    if (!contentChangedOrSignificantFieldChanged && Object.keys(fieldsToUpdate).length === 0) {
        console.log(`No significant changes detected for article ${articleId}. Returning current data.`);
        // Re-populate to ensure response is consistent
        const currentArticleData = await Article.findById(articleId)
            .populate('userIds', 'name email')
            .populate('pendingApprovals.userId', 'name email')
            .populate('lastEditedBy', 'name email');
        return res.status(200).json({ success: true, data: currentArticleData, message: "No changes applied." });
    }
    

    // --- ADD lastEditedBy and Increment Version IF changes were made ---
    if (contentChangedOrSignificantFieldChanged || Object.keys(fieldsToUpdate).length > 0) {
        fieldsToUpdate.lastEditedBy = currentUser.id;
        fieldsToUpdate.version = (article.version || 1) + 1; // Increment version
    }
    // --- END ---
    
    console.log(`--- CHECKING WORKFLOW (Before decision on fieldsToUpdate) ---`); // Moved log earlier
    console.log(`Original Status: ${originalStatus}`);
    console.log(`Content or Significant Field Changed: ${contentChangedOrSignificantFieldChanged}`);
    // console.log(`Fields to Update (before workflow addition):`, JSON.stringify(fieldsToUpdate, null, 2)); // Log before status potentially added

    // --- WORKFLOW: Status and Approval Logic based on originalStatus and changes ---
    if (contentChangedOrSignificantFieldChanged) {
        // Any significant edit clears existing translations as they might be invalid
        fieldsToUpdate.translatedContent = new Map(); // Or {} if your schema default is an object
        console.log(`Significant changes detected for article ${articleId}, clearing translations.`);

        if (article.userIds.length > 1) { // Multi-author article
            fieldsToUpdate.status = 'Pending Approval';
            // Reset pendingApprovals for all other co-authors
            fieldsToUpdate.pendingApprovals = newAuthorIdStrings // Use the potentially updated list of authors
                .filter(authorIdStr => authorIdStr !== currentUser.id.toString())
                .map(authorIdStr => ({ userId: authorIdStr, approved: false }));
            
            console.log(`Article ${articleId} (was ${originalStatus}) changed. Set to 'Pending Approval'. Approvals reset for ${fieldsToUpdate.pendingApprovals.length} co-authors.`);
        } else { // Single-author article
            // If a single author edits their own Draft/Pending/Rejected article, it remains Draft.
            // If they edit their own Published article, it should go to Pending Admin Review.
            if (originalStatus === 'Published') {
                fieldsToUpdate.status = 'Pending Admin Review';
                console.log(`Single-author published article ${articleId} edited. Set to 'Pending Admin Review'.`);
            } else if (originalStatus !== 'Draft' && originalStatus !== 'Pending Approval') { // e.g. was Rejected or Pending Admin Review
                 fieldsToUpdate.status = 'Draft'; // Or Pending Admin Review if that's the flow for single author resubmission
                 console.log(`Single-author non-published article ${articleId} (was ${originalStatus}) edited. Set to 'Draft'.`);
            }
            // For Draft, status doesn't change here due to edit by single author
            fieldsToUpdate.pendingApprovals = []; // No co-author approvals needed
        }

        // If it was published and is now being reverted, clear publishedAt and add a system note
        if (originalStatus === 'Published') {
            fieldsToUpdate.publishedAt = null; // Clear previous publication date
            const note = `[System] Reverted to '${fieldsToUpdate.status}' due to edits on ${new Date().toLocaleDateString()} by ${currentUser.name || currentUser.id}.`;
            fieldsToUpdate.reviewNotes = article.reviewNotes ? `${article.reviewNotes}\n${note}` : note;
        }
    }
    // --- END WORKFLOW ---

    // --- CORRECTED Plagiarism Check ---
    // Check if 'content' is being updated OR if it's a new article where plagiarism hasn't been checked
    // For updates, only re-check if content actually changed and is in fieldsToUpdate.
    if (fieldsToUpdate.hasOwnProperty('content')) {
        console.log('Initiating plagiarism check for updated content...');
        // The content to check is fieldsToUpdate.content (the new content)
        const contentForPlagiarismCheck = fieldsToUpdate.content;
        
        fieldsToUpdate.plagiarismStatus = Article.schema.path('plagiarismStatus').defaultValue; // Reset status
        fieldsToUpdate.plagiarismScore = null; // Reset score

        try {
            const plagiarismResult = await PlagiarismService.check(contentForPlagiarismCheck);
            fieldsToUpdate.plagiarismStatus = plagiarismResult.status;
            fieldsToUpdate.plagiarismScore = plagiarismResult.score;
            if (plagiarismResult.isFlagged) {
                console.warn(`Updated content flagged for plagiarism: ${plagiarismResult.score}%`);
            }
        } catch (plagError) {
           console.error('Plagiarism check service failed on update:', plagError.message);
           fieldsToUpdate.plagiarismStatus = 'Check Failed';
           fieldsToUpdate.plagiarismScore = null;
           // Optional: Decide if this error should prevent the update
           // return next(new ErrorResponse(`Plagiarism check service failed: ${plagError.message}`, 503));
        }
    }
    // --- End Plagiarism Check ---

     console.log(`--- FINAL fieldsToUpdate for Article ${articleId}:`, JSON.stringify(fieldsToUpdate, null, 2));

    // Only proceed if there are actual fields to update OR if the status was changed by the workflow
    // (even if no other fields changed, a status change is an update)
    if (Object.keys(fieldsToUpdate).length === 0) {
        const currentArticleData = await Article.findById(articleId).populate('userIds', 'name email').populate('pendingApprovals.userId', 'name email').populate('lastEditedBy', 'name email');
        return res.status(200).json({ success: true, data: currentArticleData, message: "No database fields were modified." });
    }

    const updatedArticle = await Article.findByIdAndUpdate(articleId, { $set: fieldsToUpdate }, {
        new: true, runValidators: true
    })
    .populate('userIds', 'name email')
    .populate('pendingApprovals.userId', 'name email')
    .populate('lastEditedBy', 'name email');

    if (!updatedArticle) {
        if (files) { // If update failed, attempt to clean up newly uploaded files for THIS request
            if (files.imageUrl) deleteUploadedFile(files.imageUrl[0].path);
            if (files.attachments) files.attachments.forEach(f => deleteUploadedFile(f.path));
        }
        return next(new ErrorResponse(`Article update failed for id ${articleId}`, 500));
    }
    res.status(200).json({ success: true, data: updatedArticle });
});

// @desc    Get all PUBLISHED articles with filtering, searching, sorting, pagination
// @route   GET /api/articles
// @access  Public
// TU-E-NEWS-BACKEND/controllers/articleController.js
const getArticles = asyncHandler(async (req, res, next) => {
    const {
        category: categoryFilter,
        authorId,
        sortBy: sortByParam,
        search
    } = req.query;

    // --- PARSE AND PROVIDE DEFAULTS FOR PAGE AND LIMIT ---
    const currentPage = parseInt(req.query.page, 10) || 1;
    const itemsPerPage = parseInt(req.query.limit, 10) || 10; // Use a different variable name
    // --- END PARSE ---

    let queryFilters = { status: 'Published' };

    if (search && search.trim() !== '') {
        queryFilters.$text = { $search: search.trim() };
    }
    if (categoryFilter) { // categoryFilter is what backend receives from ?category=...
      console.log(`Backend received category filter: "${categoryFilter}" (Type: ${typeof categoryFilter})`); // DEBUG
      queryFilters.category = categoryFilter;
    }
    if (authorId) {
        queryFilters.userIds = authorId;
    }

    let query = Article.find(queryFilters);
    let effectiveSortBy;

    if (search && search.trim() !== '' && !sortByParam) {
        query = query.select({ score: { $meta: "textScore" } });
        effectiveSortBy = { score: { $meta: "textScore" } };
    } else if (sortByParam) {
        const sortParts = sortByParam.split(',');
        effectiveSortBy = {};
        sortParts.forEach(part => {
            const [field, orderDirection = 'asc'] = part.split(':');
            effectiveSortBy[field.trim()] = orderDirection.toLowerCase() === 'desc' ? -1 : 1;
        });
    } else {
        effectiveSortBy = { publishedAt: -1, createdAt: -1 };
    }
    query = query.sort(effectiveSortBy);
=======
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
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

    // Use the parsed numeric values for calculations
    const startIndex = (currentPage - 1) * itemsPerPage;
    // endIndex is not strictly needed for constructing pagination object if using total and articles.length

    const total = await Article.countDocuments(queryFilters);
    
    query = query.skip(startIndex).limit(itemsPerPage).populate('userIds', 'name email');
    const articles = await query;

    const pagination = {};
    // Check if there are more articles to show for the next page
    if ((startIndex + articles.length) < total) {
        console.log(`Backend: Current page type: ${typeof currentPage}, value: ${currentPage}`);
        console.log(`Backend: Calculation for next page: currentPage + 1 = ${currentPage + 1}`);
        
        pagination.next = { page: currentPage + 1, limit: itemsPerPage }; // Use parsed numeric values
        
        console.log(`Backend: pagination.next object:`, pagination.next);
    }
    // Check if there's a previous page
    if (startIndex > 0) { // or currentPage > 1
        pagination.prev = { page: currentPage - 1, limit: itemsPerPage }; // Use parsed numeric values
    }

    res.status(200).json({
        success: true,
        count: articles.length,
        totalCount: total,
        pagination,
        data: articles
    });
});

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public (for Published) / Private(draft) (for Authors/Admins)
const getArticleById = asyncHandler(async (req, res, next) => {
    const article = await Article.findById(req.params.id).populate('userIds', 'name email');

    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
    }

    // --- REVISED BACKEND ACCESS CONTROL ---
    // If the article is published, anyone can see it.
    if (article.status === 'Published') {
        return res.status(200).json({
            success: true,
            data: article
        });
<<<<<<< HEAD
=======

    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ success: false, message: 'Server Error creating article' });
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
    }

    // If NOT published, only Admins or Authors of the article can see it.
    // 'protect' middleware in routes ensures req.user is set if a valid token is provided.
    // If no token (anonymous user), req.user will be undefined.
    if (!req.user) {
        // Anonymous user trying to access a non-published article
        return next(new ErrorResponse(`Article not found or not available with id of ${req.params.id}`, 404));
    }

<<<<<<< HEAD
    const isAdmin = req.user.role === 'admin';
    // Ensure article.userIds is an array before calling .some()
    const isAnAuthor = Array.isArray(article.userIds) && article.userIds.some(
        // Compare with the string representation of the ObjectId
        authorIdObj => authorIdObj._id.toString() === req.user.id
    );
=======
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
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

    if (isAdmin || isAnAuthor) {
        // Admin or Author can view non-published articles
        return res.status(200).json({
            success: true,
<<<<<<< HEAD
            data: article
        });
    } else {
        // Authenticated user who is neither Admin nor Author trying to access non-published article
        return next(new ErrorResponse(`You are not authorized to view this article in its current state (Status: ${article.status})`, 403));
        // Or, for more obscurity, a 404:
        // return next(new ErrorResponse(`Article not found or not available with id of ${req.params.id}`, 404));
=======
            count: articles.length,
            totalCount: total, // Total matching articles
            pagination,
            data: articles
        });

    } catch (error) {
        console.error('Error getting articles:', error);
        res.status(500).json({ success: false, message: 'Server Error getting articles' });
        // next(error);
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
    }
    // --- END REVISED BACKEND ACCESS CONTROL ---
});

// @desc    Translate an article (no changes for file upload)
// TU-E-NEWS-BACKEND/controllers/articleController.js
// ... (imports: Article, asyncHandler, ErrorResponse, TranslationService) ...

const translateArticle = asyncHandler(async (req, res, next) => {
    const { targetLanguage } = req.body;
    const articleId = req.params.id;

    if (!targetLanguage) {
        return next(new ErrorResponse('Target language is required', 400));
    }

    let article = await Article.findById(articleId);
    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${articleId}`, 404));
    }
    if (!article.content) {
        return next(new ErrorResponse('Article has no content to translate.', 400));
    }

    // Initialize translatedContent if it doesn't exist
    if (!article.translatedContent) {
        article.translatedContent = new Map();
    }

    let translatedTextToReturn;

    // Check if translation already exists in the DB for this article and language
    if (article.translatedContent.has(targetLanguage)) {
        translatedTextToReturn = article.translatedContent.get(targetLanguage);
        console.log(`Returning stored stub translation for ${targetLanguage} for article ${articleId}`);
    } else {
        // If not, "generate" (from stub service) and store it
        console.log(`Generating new stub translation for ${targetLanguage} for article ${articleId}`);
        const newStubbedText = await TranslationService.translate(article.content, targetLanguage); // Your stub service
        
        article.translatedContent.set(targetLanguage, newStubbedText);
        article.markModified('translatedContent'); // Important for Map types in Mongoose
        await article.save();
        
        translatedTextToReturn = newStubbedText;
        console.log(`Stored new stub translation for ${targetLanguage}`);
    }

    // Fetch the potentially updated article to ensure the response reflects the DB state
    const finalArticle = await Article.findById(articleId).populate('userIds', 'name email');


    res.status(200).json({
        success: true,
        message: `Article translation stub for ${targetLanguage} processed.`,
        // Send back the specific translated text and the whole updated article object
        // So frontend can update its 'article' state which includes the 'translatedContent' map
        data: {
            article: finalArticle, // Send the whole updated article
            requestedLang: targetLanguage,
            translatedText: translatedTextToReturn // The specific text for the requested language
        }
    });
});

// @desc    Delete an article
// @route   DELETE /api/articles/:id
const deleteArticle = asyncHandler(async (req, res, next) => {

    const articleId = req.params.id; // Get articleId from params

    const article = await Article.findById(req.params.id);
    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
    }

    // --- CORRECTED Authorization Check ---
    if (!isUserAuthorizedForArticle(article, req.user)) {
        return next(new ErrorResponse('User not authorized to delete this article', 403));
    }

    // Delete associated files before deleting the article document
    if (article.imageUrl) {
        deleteFileByUrl(article.imageUrl);
    }
    if (article.attachments && article.attachments.length > 0) {
        article.attachments.forEach(att => deleteFileByUrl(att.fileUrl));
    }

    try {
        const deleteCommentsResult = await Comment.deleteMany({ articleId: article._id });
        console.log(`Deleted ${deleteCommentsResult.deletedCount} comments associated with article ${article._id}`);
    } catch (commentError) {
        // Log the error, but don't necessarily stop the article deletion process
        // unless it's critical. Orphaned comments are bad, but a failed article delete due to
        // comment deletion failure might be worse for user experience. This is a design choice.
        console.error(`Error deleting comments for article ${article._id}:`, commentError);
        // Optionally, you could return an error here if comment deletion is paramount:
        // return next(new ErrorResponse(`Failed to delete associated comments. Article not deleted. Error: ${commentError.message}`, 500));
    }

    await Article.deleteOne({ _id: article._id });
    res.status(200).json({ success: true, message: 'Article deleted successfully', data: {} });
});

// @desc    Get articles authored by the logged-in user
// @route   GET /api/articles/my-articles/all
// @access  Private (Editor, Admin)
const getMyArticles = asyncHandler(async (req, res, next) => {
    const userId = req.user.id; // From 'protect' middleware

    // Basic pagination (can be enhanced with express-validator for query params)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const queryFilters = { userIds: userId }; // Find articles where this user is one of the authors

    // Optional: Allow filtering by status for "my articles" view
    if (req.query.status && Article.schema.path('status').enumValues.includes(req.query.status)) {
        queryFilters.status = req.query.status;
    }

    const total = await Article.countDocuments(queryFilters);
    const articles = await Article.find(queryFilters)
        .sort({ createdAt: -1 }) // Or any other preferred sort
        .skip(startIndex)
        .limit(limit)
        .populate('userIds', 'name email'); // Populate author details

    const pagination = {};
    if ((startIndex + articles.length) < total) { // Corrected pagination logic slightly
        pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
        success: true,
        count: articles.length, // Count for the current page
        totalCount: total,     // Total matching articles for this user & filters
        pagination,
        data: articles
    });
});


// @desc    Get ALL articles (for Admin management)
// @route   GET /api/admin/articles  <-- Ensure this is the actual route it's connected to
// @access  Private (Admin only)
const getAdminAllArticles = asyncHandler(async (req, res, next) => {
    // Parse and provide defaults for page and limit
    const currentPage = parseInt(req.query.page, 10) || 1;
    const itemsPerPage = parseInt(req.query.limit, 10) || 10;

    const startIndex = (currentPage - 1) * itemsPerPage;

    const queryFilters = {}; // Start with no filters to get all for admin

    // Apply filters from query parameters
    if (req.query.status && Article.schema.path('status').enumValues.includes(req.query.status)) {
        queryFilters.status = req.query.status;
    }
    if (req.query.category && Article.schema.path('category').enumValues.includes(req.query.category)) {
        queryFilters.category = req.query.category;
    }
    if (req.query.authorId && mongoose.Types.ObjectId.isValid(req.query.authorId)) { // Validate authorId format
        queryFilters.userIds = req.query.authorId; // Find articles where this author is one of the authors
    }
    // Optional: Add text search for admins if needed
    if (req.query.search && req.query.search.trim() !== '') {
        queryFilters.$text = { $search: req.query.search.trim() };
    }

    console.log(`Admin fetching articles with filters:`, queryFilters, `Page: ${currentPage}, Limit: ${itemsPerPage}`);

    const total = await Article.countDocuments(queryFilters);
    
    let query = Article.find(queryFilters)
        .sort({ createdAt: -1 }) // Default sort for admin view (e.g., newest created first)
        .skip(startIndex)
        .limit(itemsPerPage)
        .populate('userIds', 'name email')       // Populate authors' names and emails
        .populate('lastEditedBy', 'name email'); // Populate who last edited it

    // If search is active and no other sort, sort by relevance
    if (queryFilters.$text && !req.query.sortBy) {
        query = query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
    }


    const articles = await query;

    const pagination = {};
    if ((startIndex + articles.length) < total) {
        pagination.next = { page: currentPage + 1, limit: itemsPerPage };
    }
    if (currentPage > 1 && total > 0) { // Or startIndex > 0
        pagination.prev = { page: currentPage - 1, limit: itemsPerPage };
    }

    res.status(200).json({
        success: true,
        count: articles.length,    // Number of articles on the current page
        totalCount: total,         // Total articles matching the filter
        pagination,
        data: articles
    });
});

// --- MODIFICATION for updateArticleStatus to include reviewNotes ---
// @desc    Update article status (e.g., Publish, Reject) and add review notes
// @route   PUT /api/articles/:id/status
// @access  Private (Admin only - as per route config)
const updateArticleStatus = asyncHandler(async (req, res, next) => {
    // ID and status validation handled by express-validator in routes
    const { status, reviewNotes } = req.body; // Expect reviewNotes
    const articleId = req.params.id;

    const allowedStatuses = Article.schema.path('status').enumValues;
    if (!status || !allowedStatuses.includes(status)) { // Redundant if express-validator handles it, but good safeguard
        return next(new ErrorResponse(`Invalid status: '${status}'. Must be one of: ${allowedStatuses.join(', ')}`, 400));
    }

    let article = await Article.findById(articleId);
    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${articleId}`, 404));
    }

    // Authorization handled by route middleware

    const oldStatus = article.status;
    article.status = status;

    if (status === 'Published' && oldStatus !== 'Published') {
        article.publishedAt = new Date();
    }else if (status !== 'Published' && article.publishedAt && oldStatus === 'Published') {
        // If unpublishing a previously published article
        article.publishedAt = undefined; // Optional: clear if moving away from published
    }


    // Update review notes if provided (even if status doesn't change, notes might)
    if (reviewNotes !== undefined) { // Check for undefined to allow clearing notes with an empty string
        article.reviewNotes = reviewNotes.trim();
    }


    await article.save();

    res.status(200).json({
        success: true,
        data: article
    });
});

// @desc    Like or Unlike an article
// @route   PUT /api/articles/:id/like
// @access  Private (Logged-in users)
const likeArticle = asyncHandler(async (req, res, next) => {
    const articleId = req.params.id;
    const userId = req.user.id; // From 'protect' middleware

    const article = await Article.findById(articleId);

    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${articleId}`, 404));
    }

    // Check if the user has already liked the article
    const alreadyLikedIndex = article.likedBy.findIndex(likerId => likerId.toString() === userId);

    let updatedArticle;
    let message;

    if (alreadyLikedIndex > -1) {
        // User has already liked, so UNLIKE
        article.likedBy.splice(alreadyLikedIndex, 1); // Remove user's ID
        message = 'Article unliked successfully';
    } else {
        // User has not liked yet, so LIKE
        article.likedBy.push(userId); // Add user's ID
        message = 'Article liked successfully';
    }

    // Update the denormalized likesCount
    article.likesCount = article.likedBy.length;

    updatedArticle = await article.save();

    res.status(200).json({
        success: true,
        message: message,
        data: {
            // Send back relevant parts, e.g., new likes count and whether current user liked it
            likesCount: updatedArticle.likesCount,
            // Optionally, check if current user (req.user.id) is in updatedArticle.likedBy and send that boolean
            // isLikedByCurrentUser: updatedArticle.likedBy.some(id => id.toString() === userId)
        }
    });
});

// @desc    A co-author approves an article version
// @route   PUT /api/articles/:id/approve-coauthor
// @access  Private (Must be one of the article's authors)
const approveCoAuthor = asyncHandler(async (req, res, next) => {
    const articleId = req.params.id;
    const currentUserId = req.user.id; // User making the approval request

    let article = await Article.findById(articleId);

    if (!article) {
        return next(new ErrorResponse(`Article not found with id ${articleId}`, 404));
    }

    // 1. Check if the article is actually in 'Pending Approval' status
    if (article.status !== 'Pending Approval') {
        return next(new ErrorResponse(`Article is not currently awaiting co-author approvals (Status: ${article.status})`, 400));
    }

    // 2. Check if the current user is one of the authors of this article
    const isAnAuthor = article.userIds.some(authorIdObj => authorIdObj.toString() === currentUserId);
    if (!isAnAuthor) {
        return next(new ErrorResponse('You are not an author of this article and cannot approve it.', 403));
    }

    // 3. Find the user in the pendingApprovals array and update their status
    let approvalUpdated = false;
    let allApproved = true; // Assume all approved initially

    if (!article.pendingApprovals || article.pendingApprovals.length === 0) {
        // This case might occur if it's a single-author article mistakenly in 'Pending Approval'
        // or if approvals were prematurely cleared. Consider changing status to 'Pending Admin Review'.
        console.warn(`Article ${articleId} is 'Pending Approval' but has no pendingApprovals entries. Advancing to 'Pending Admin Review'.`);
        article.status = 'Pending Admin Review';
        // article.pendingApprovals = []; // Ensure it's empty
    } else {
        article.pendingApprovals.forEach(approval => {
            if (approval.userId.toString() === currentUserId) {
                if (!approval.approved) { // Only update if not already approved
                    approval.approved = true;
                    approval.approvedAt = new Date();
                    approvalUpdated = true;
                }
            }
            // Check if any co-author (excluding the original submitter if they are not in this list)
            // still needs to approve. The list should only contain co-authors needing approval.
            if (!approval.approved) {
                allApproved = false;
            }
        });

        if (!approvalUpdated) {
            // User might have already approved or is not in the pending list for this version.
            // Check if they were the one who submitted this version (lastEditedBy)
            if (article.lastEditedBy && article.lastEditedBy.toString() === currentUserId) {
                 return res.status(200).json({ success: true, message: 'You are the last editor; your approval is implicit. Waiting for other co-authors.', data: article });
            }
            return next(new ErrorResponse('Your approval was not pending or already recorded for this version.', 400));
        }

        // 4. If all co-authors (in the pendingApprovals list) have approved
        if (allApproved) {
            article.status = 'Pending Admin Review';
            // Optional: Clear pendingApprovals array now that it's done, or keep for history
            // article.pendingApprovals = []; // Clears the list
            console.log(`All co-authors approved article ${articleId}. Status changed to Pending Admin Review.`);
            // TODO: Future - Notify primary author/all authors/admins
        }
    }

    article.lastEditedBy = currentUserId; // Record who took this approval action as last editor for this stage
    await article.save();

    // Populate for response
    const populatedArticle = await Article.findById(articleId)
        .populate('userIds', 'name email')
        .populate('pendingApprovals.userId', 'name email')
        .populate('lastEditedBy', 'name email');

    res.status(200).json({
        success: true,
        message: approvalUpdated ? 'Your approval has been recorded.' : 'Approval status checked.',
        data: populatedArticle
    });
});



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
<<<<<<< HEAD
    updateArticle,
    deleteArticle,
    getMyArticles,
    getAdminAllArticles,
    updateArticleStatus,
    likeArticle,
    translateArticle,
    approveCoAuthor
};
=======
    updateArticle,       
    deleteArticle,       
    updateArticleStatus,
    likeArticle,
    translateArticle  
};
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
