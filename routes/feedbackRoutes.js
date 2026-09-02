const express = require('express');
const router = express.Router();
const { getFeedbacks, getFeedback, replyToFeedback, analyzeFeedback } = require('../controllers/feedbackController');

router.get('/', getFeedbacks);
router.get('/:id', getFeedback);
router.post('/:id/reply', replyToFeedback);
router.post('/:id/analyze', analyzeFeedback);

module.exports = router;