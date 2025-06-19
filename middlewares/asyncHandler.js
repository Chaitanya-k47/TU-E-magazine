// middlewares/asyncHandler.js
const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next); // Catches promise rejections and passes them to the error handler

module.exports = asyncHandler;