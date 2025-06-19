const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes'); // Import comment routes for nesting
const directCommentRoutes = require('./routes/directCommentRoutes'); // Import direct comment routes
<<<<<<< HEAD
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
=======

>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

require('dotenv').config();

const app = express();
// --- Configure CORS first ---
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend origin
  optionsSuccessStatus: 200
};

// Connect to database
connectDB();

// Middlewares
app.use(cors(corsOptions));
app.use(
  helmet({
    // Set crossOriginResourcePolicy to allow your frontend to load images
    // Option 1: Allow all cross-origin requests for resources (simpler for dev)
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // Option 2: Or disable it if CORS ACAO header is sufficient for your needs
    // crossOriginResourcePolicy: false,

    // You can also fine-tune other helmet policies if needed,
    // but CORP is the one causing the image block.
    // COOP 'same-origin' is generally fine and secure unless you specifically need cross-origin popups
    // to interact directly with your main window, which is rare.
    // For COOP, if you ever need more permissive, it would be:
    // crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // or "unsafe-none" (less secure)
  })
);        // Secure headers

app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));
// --- Serve static files from the 'public' directory ---
// This means anything in 'public' (like 'public/uploads/filename.jpg')
// will be accessible via http://localhost:5000/uploads/filename.jpg
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', directCommentRoutes);
<<<<<<< HEAD
app.use('/api/admin', adminRoutes);
=======
>>>>>>> 3ff55140633ef0d5ad84ff3d20107e42d53ba59e

// Mount nested comment routes under articles
// This line means that requests to /api/articles/:articleId/comments will be handled by commentRoutes
articleRoutes.use('/:articleId/comments', commentRoutes); // Nest comment routes


// Test route
app.get('/', (req, res) => {
    res.send('Welcome to TU-e-News Backend 🚀');
});

// Mount the error handling middleware - MUST BE LAST
app.use(errorHandler);

module.exports = app;
