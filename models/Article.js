// models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    // === Existing Fields ===
    userId: { // Renamed from authorId in SRS schema example for consistency with your code
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true,
        index: true // Indexing for potential author-based filtering
    },
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
    attachments: [{ // Array to store URLs or references to attached files (PDFs, etc.)
        fileName: String, // Optional: Store original filename
        fileUrl: String, // URL to the stored file
        fileType: String // Optional: MIME type (e.g., 'application/pdf')
    }],

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


}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Optional: Add a text index for searching title and content
// articleSchema.index({ title: 'text', content: 'text' }); // Uncomment if you plan text search

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;