const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true
    },
    title: {
        type: String,
        required: [true, 'Article must have a title']
    },
    content: {
        type: String,
        required: [true, 'Article must have content']
    },
    author: {
        type: String,
        default: 'Anonymous'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
