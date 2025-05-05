const authorize = (...roles) => {
    return (req, res, next) => {
      // req.user should be attached by the 'protect' middleware before this
      if (!req.user) {
        // Should ideally not happen if 'protect' runs first
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
  
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ // 403 Forbidden is more appropriate than 401 Unauthorized
          success: false,
          message: `User role '${req.user.role}' is not authorized to access this route`
        });
      }
      next();
    };
  };
  
  module.exports = { authorize };