const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // make sure User model exists

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  const{token}=req.cookies 
   if(!token)return res.status(401).json({success:false,message:"Before access that page you have to login first"})

    try {
     
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(401).json({ message: 'Token verification failed' });
    }
});

// Middleware to check for admin role
const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, isAdmin };
