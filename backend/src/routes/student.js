// Student routes
const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../controllers/authController');
const {
  getProfile,
  updateProfile,
  getLessons,
  completeLesson,
  getMessages,
  sendMessage
} = require('../controllers/studentController');

// Apply authentication middleware to all routes
router.use(verifyAuth);

// Profile routes
// GET /api/student/profile
router.get('/profile', getProfile);

// PUT /api/student/profile
router.put('/profile', updateProfile);

// Lesson routes
// GET /api/student/lessons
router.get('/lessons', getLessons);

// PUT /api/student/lessons/:lessonId/complete
router.put('/lessons/:lessonId/complete', completeLesson);

// Message routes
// GET /api/student/messages/:instructorId
router.get('/messages/:instructorId', getMessages);

// POST /api/student/messages
router.post('/messages', sendMessage);

module.exports = router;
