const express = require('express');
const { createPoll, getPolls, getPoll, votePoll } = require('../controllers/polls');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/:id', getPoll);

// Protected routes
router.post('/', protect, createPoll);
router.post('/:id/vote', protect, votePoll);

module.exports = router;