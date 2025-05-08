const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes'); // Import comment routes for nesting
const directCommentRoutes = require('./routes/directCommentRoutes'); // Import direct comment routes


require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middlewares
app.use(express.json()); // Body parser
app.use(cors());          // Enable CORS
app.use(helmet());        // Secure headers

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', directCommentRoutes);

// Mount nested comment routes under articles
// This line means that requests to /api/articles/:articleId/comments will be handled by commentRoutes
articleRoutes.use('/:articleId/comments', commentRoutes); // Nest comment routes


// Test route
app.get('/', (req, res) => {
    res.send('Welcome to TU-e-News Backend 🚀');
});

module.exports = app;
