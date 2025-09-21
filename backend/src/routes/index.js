// Routes chính cho API
const express = require('express');
const router = express.Router();

// Import các route modules
const authRoutes = require('./auth');
const instructorRoutes = require('./instructor');
const studentRoutes = require('./student');

// Sử dụng các routes
router.use('/auth', authRoutes);
router.use('/instructor', instructorRoutes);
router.use('/student', studentRoutes);

// Route test
router.get('/test', (req, res) => {
  res.json({ message: 'API Routes are working!' });
});

module.exports = router;
