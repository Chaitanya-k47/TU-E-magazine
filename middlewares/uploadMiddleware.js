// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module
const { ErrorResponse } = require('./errorMiddleware'); // For sending errors

// --- Ensure upload directory exists ---
const uploadsDir = path.join(__dirname, '../public/uploads'); // Go up one dir from middleware, then to public/uploads
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // Create directory if it doesn't exist
}

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save files to 'public/uploads'
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// --- File Filter ---
// Example: Allow only images for 'imageUrl' and PDFs/Docs for 'attachments'
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "imageUrl") {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
            cb(null, true);
        } else {
            cb(new ErrorResponse('Only .jpeg, .png, or .gif images are allowed for imageUrl!', 400), false);
        }
    } else if (file.fieldname === "attachments") {
        if (
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' || // .doc
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ) {
            cb(null, true);
        } else {
            cb(new ErrorResponse('Only PDF or Word documents are allowed for attachments!', 400), false);
        }
    } else {
        // For any other unexpected field, reject
        cb(new ErrorResponse('Unexpected file field!', 400), false);
    }
};

// --- Multer Upload Instance ---
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit (adjust as needed)
    },
    fileFilter: fileFilter
});




// --- Custom Middleware to handle specific fields ---

const actualMulterFieldsHandler = upload.fields([ // Renamed the multer instance application
    { name: 'imageUrl', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
]);

const handleArticleUploads = (req, res, next) => {
    console.log('>>> handleArticleUploads middleware CALLED <<<'); // Log when it's called
    console.log('Request Content-Type:', req.get('Content-Type')); // Log the content type

    actualMulterFieldsHandler(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('MulterError in handleArticleUploads:', err);
            return next(new ErrorResponse(`File Upload Error: ${err.message}`, 400));
        } else if (err) {
            // An unknown error occurred when uploading (e.g., from fileFilter).
            console.error('Unknown error in handleArticleUploads multer processing:', err);
            // If 'err' is already an ErrorResponse from fileFilter, it will be handled by global error handler.
            // Otherwise, wrap it.
            if (err instanceof ErrorResponse) return next(err);
            return next(new ErrorResponse(`File Upload Error: ${err.message || 'An issue occurred'}`, 400));
        }
        // Everything went fine with multer, or no files to process by multer for these fields
        console.log('>>> handleArticleUploads: Multer processing DONE (or no relevant fields) <<<');
        console.log('>>> req.body AFTER multer in handleArticleUploads:', JSON.stringify(req.body));
        console.log('>>> req.files AFTER multer in handleArticleUploads:', req.files);
        next();
    });
};


module.exports = { handleArticleUploads };