// Authentication routes
const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, verifyAuth } = require('../controllers/authController');

// POST /api/auth/send-otp
router.post('/send-otp', sendOTP);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOTP);

// GET /api/auth/verify-token
router.get('/verify-token', verifyAuth, (req, res) => {
  res.json({ 
    success: true, 
    user: {
      id: req.user.id,
      phoneNumber: req.user.phoneNumber,
      name: req.user.name,
      role: req.user.role
    }
  });
});

module.exports = router;
