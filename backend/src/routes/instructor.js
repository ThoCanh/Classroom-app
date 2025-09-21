// Instructor routes
const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../controllers/authController');
const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  createLesson,
  getLessons,
  assignStudent
} = require('../controllers/instructorController');

// Apply authentication middleware to all routes
router.use(verifyAuth);

// Student management routes
// POST /api/instructor/students
router.post('/students', addStudent);

// GET /api/instructor/students
router.get('/students', getStudents);

// PUT /api/instructor/students/:studentId
router.put('/students/:studentId', updateStudent);

// DELETE /api/instructor/students/:studentId
router.delete('/students/:studentId', deleteStudent);

// POST /api/instructor/assign-student
router.post('/assign-student', assignStudent);

// Lesson management routes
// POST /api/instructor/lessons
router.post('/lessons', createLesson);

// GET /api/instructor/lessons
router.get('/lessons', getLessons);

module.exports = router;
