// TU-E-NEWS-BACKEND/middlewares/normalizeBodyMiddleware.js
const normalizeBodyMiddleware = (req, res, next) => {
    if (req.body && typeof req.body === 'object' && Object.getPrototypeOf(req.body) === null) {
        // If body exists, is an object, and has no prototype (likely from multer)
        console.log('Normalizing req.body for express-validator...');
        req.body = { ...req.body }; // Spread into a new object with default prototype
    }
    next();
};
module.exports = normalizeBodyMiddleware;