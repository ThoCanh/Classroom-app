// User routes
const express = require('express');
const router = express.Router();

// GET /api/users
router.get('/', (req, res) => {
  res.json({ message: 'Get all users - Coming soon' });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ message: `Get user ${req.params.id} - Coming soon` });
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  res.json({ message: `Update user ${req.params.id} - Coming soon` });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete user ${req.params.id} - Coming soon` });
});

module.exports = router;
