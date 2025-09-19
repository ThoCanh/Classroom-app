// Classroom routes
const express = require('express');
const router = express.Router();

// GET /api/classrooms
router.get('/', (req, res) => {
  res.json({ message: 'Get all classrooms - Coming soon' });
});

// POST /api/classrooms
router.post('/', (req, res) => {
  res.json({ message: 'Create classroom - Coming soon' });
});

// GET /api/classrooms/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get classroom ${req.params.id} - Coming soon` });
});

// PUT /api/classrooms/:id
router.put('/:id', (req, res) => {
  res.json({ message: `Update classroom ${req.params.id} - Coming soon` });
});

// DELETE /api/classrooms/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete classroom ${req.params.id} - Coming soon` });
});

module.exports = router;
