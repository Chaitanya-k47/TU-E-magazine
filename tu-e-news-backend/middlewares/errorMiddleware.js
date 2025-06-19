// middlewares/errorMiddleware.js

// Custom ErrorResponse class (optional, but good for structured errors)
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Capturing stack trace, excluding constructor call from it (Error.captureStackTrace is V8 specific)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}


const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message; // Ensure message property is set

    // Log to console for the developer
    console.error('-------------------- ERROR LOG --------------------');
    console.error('Error Name:', err.name || 'N/A');
    console.error('Error Message:', err.message || 'No message');
    console.error('Error Status Code:', err.statusCode || 'N/A');
    // console.error('Full Error Object:', err); // Uncomment for more detailed logging if needed
    // console.error('Stack Trace:', err.stack || 'No stack trace');
    console.error('------------------ END ERROR LOG ------------------');


    // Mongoose bad ObjectId (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key (MongoError, code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value entered for '${field}': '${value}'. Please use another value.`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error (ValidationError)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        // Could join messages or take the first one
        const message = `Validation Failed: ${messages.join('. ')}`;
        error = new ErrorResponse(message, 400);
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = new ErrorResponse(message, 401); // Unauthorized
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Your session has expired. Please log in again.';
        error = new ErrorResponse(message, 401); // Unauthorized
    }


    // Handle custom ErrorResponse or fall back to 500
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
        // Optionally, include stack trace in development mode
        // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
};

module.exports = { errorHandler, ErrorResponse }; // Export ErrorResponse too