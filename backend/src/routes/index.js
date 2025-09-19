// Routes chính cho API
const express = require('express');
const router = express.Router();

// Import các route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const classroomRoutes = require('./classrooms');
// const firebaseTestRoutes = require('./firebase-test');

// Sử dụng các routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/classrooms', classroomRoutes);
// router.use('/', firebaseTestRoutes);

// Route test
router.get('/test', (req, res) => {
  res.json({ message: 'API Routes are working!' });
});

module.exports = router;
