const jwt = require('jsonwebtoken');

// Optional authentication middleware - allows requests with or without tokens
const optionalAuth = async (req, res, next) => {
    let token;
  
    // Check if token exists in the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // Get token from header (format: "Bearer TOKEN")
        token = req.headers.authorization.split(' ')[1];
  
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        // Get user from the token (exclude password)
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Continue as a non-authenticated user
        console.log('Token verification failed, continuing as unauthenticated user');
        req.user = null;
      }
    } else {
      // No token, set user to null
      req.user = null;
    }
  
    // Always proceed to the next middleware
    next();
  };
  
  module.exports = { optionalAuth };