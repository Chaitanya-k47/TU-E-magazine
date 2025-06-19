// models/Article.js
const mongoose = require('mongoose');

<<<<<<< HEAD
const approvalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
=======
const articleSchema = new mongoose.Schema({
    // === Existing Fields ===
    userId: { // Renamed from authorId in SRS schema example for consistency with your code
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true,
        index: true // Indexing for potential author-based filtering
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
    },
    approved: {
        type: Boolean,
        default: false
    },
    approvedAt: {
        type: Date
    }
}, { _id: false }); // _id: false because this will be an array of subdocuments

const articleSchema = new mongoose.Schema({
    // === Existing Fields ===
    userIds: [{ // Renamed from userId to userIds for clarity
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Still require at least one author
    }],
    title: {
        type: String,
        required: [true, 'Article must have a title'],
        trim: true // Remove leading/trailing whitespace
    },
    content: {
        type: String,
        required: [true, 'Article must have content']
    },

    // === New Fields based on SRS ===
    category: {
        type: String,
        required: [true, 'Article must belong to a category'],
        enum: ['Academics', 'Events', 'Research', 'Campus Life', 'Achievements', 'Announcements', 'Other'], // Example categories from SRS context - adjust as needed
        index: true // Indexing for category filtering
<<<<<<< HEAD
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending Approval', 'Pending Admin Review', 'Published', 'Rejected'],
        default: 'Draft', // Default status when an editor creates an article
        required: true,
        index: true // Indexing for filtering by status (e.g., getting published articles)
    },
    language: {
        type: String,
        default: 'en', // Default language (e.g., English)
        required: true
    },
    translatedContent: {
        // Stores translations as key-value pairs, e.g., { "es": "...", "fr": "..." }
        type: Map,
        of: String, // Values in the map will be strings
        default: {}
    },
    plagiarismStatus: {
        type: String,
        enum: ['Not Checked', 'Pending', 'Checked - OK', 'Checked - Flagged', 'Check Failed'], // More explicit statuses
        default: 'Not Checked',
        required: true
    },

    plagiarismScore: {
        type: Number, // Store as a percentage, e.g., 15 for 15%
        min: 0,
        max: 100,
        default: null // Or 0 if 'Not Checked' means 0 score
    },

    // --- Multimedia Fields ---
    imageUrl: { // For a primary image associated with the article
        type: String,
        default: '' // Store the URL of the image
    },
    
=======
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Published', 'Rejected'],
        default: 'Draft', // Default status when an editor creates an article
        required: true,
        index: true // Indexing for filtering by status (e.g., getting published articles)
    },
    language: {
        type: String,
        default: 'en', // Default language (e.g., English)
        required: true
    },
    translatedContent: {
        // Stores translations as key-value pairs, e.g., { "es": "...", "fr": "..." }
        type: Map,
        of: String, // Values in the map will be strings
        default: {}
    },
    plagiarismStatus: {
        type: String,
        enum: ['Not Checked', 'Pending', 'Checked - OK', 'Checked - Flagged', 'Check Failed'], // More explicit statuses
        default: 'Not Checked',
        required: true
    },

    // --- Multimedia Fields ---
    imageUrl: { // For a primary image associated with the article
        type: String,
        default: '' // Store the URL of the image
    },
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
    attachments: [{ // Array to store URLs or references to attached files (PDFs, etc.)
        fileName: String, // Optional: Store original filename
        fileUrl: String, // URL to the stored file
        fileType: String // Optional: MIME type (e.g., 'application/pdf')
    }],

<<<<<<< HEAD
    // --- MODIFIED LIKES ---
    likedBy: [{ // Array of User IDs who liked this article
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // We can keep a separate 'likesCount' or use a virtual if preferred for query efficiency
    likesCount: { // Denormalized count for easier querying/display
        type: Number,
        default: 0,
        min: 0
    },
    // --- END MODIFIED LIKES ---

    commentCount: {
        type: Number,
        default: 0,
        min: 0
    },

    publishedAt: {
        type: Date,
        index: true // Index for sorting by publication date
    },

    reviewNotes: {
        type: String,
        trim: true,
        default: '' // Default to empty string
    },

    authorNamesText: {
        type: String,
        default: ''
    },
    
    // --- NEW FIELDS FOR COLLABORATIVE WORKFLOW ---
    pendingApprovals: [approvalSchema], // Array of co-author approval statuses

    lastEditedBy: { // User ID of the last person who made a significant edit
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    version: { // Optional: for simple version tracking of content changes
        type: Number,
        default: 1,
        min: 1
    }
    // --- END NEW FIELDS ---

=======
    // --- Engagement (Optional - can be added later if preferred) ---
    likes: {
        type: Number,
        default: 0
    },
    // Optional: Store users who liked to prevent multiple likes
    // likedBy: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }],

    // === Removed Field ===
    // author: { type: String, default: 'Anonymous' }, // Removed - Use populated userId.name instead
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e


}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

<<<<<<< HEAD
// Text index
articleSchema.index(
    {
        title: 'text',
        content: 'text',
        authorNamesText: 'text' // Add the new field here
    },
    {
        weights: {
            title: 10,
            authorNamesText: 7, // Give author names a decent weight
            content: 5
        },
        name: "article_text_search_index"
    }
);
articleSchema.index({ userIds: 1 });
articleSchema.index({ publishedAt: -1 }); // If not already there from previous step

const Article = mongoose.model('Article', articleSchema);
=======
// Optional: Add a text index for searching title and content
// articleSchema.index({ title: 'text', content: 'text' }); // Uncomment if you plan text search

const Article = mongoose.model('Article', articleSchema);

>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e
module.exports = Article;