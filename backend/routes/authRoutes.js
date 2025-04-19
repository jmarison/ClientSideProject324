const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router;