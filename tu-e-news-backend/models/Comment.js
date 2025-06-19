// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Comment text cannot be empty'],
        trim: true
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true,
        index: true
    },
    userId: { // Author of the comment
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Optional: replies to this comment
    // replies: [{
    //     text: String,
    //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    //     createdAt: { type: Date, default: Date.now }
    // }]
}, { timestamps: true }); // Adds createdAt and updatedAt

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;