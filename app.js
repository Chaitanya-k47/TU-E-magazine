const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');

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

// Test route
app.get('/', (req, res) => {
    res.send('Welcome to TU-e-News Backend 🚀');
});

module.exports = app;
