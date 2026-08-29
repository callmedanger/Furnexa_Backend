const express = require('express');
const router = express.Router();
const { getFeedbacks, getFeedback } = require('../controllers/feedbackController');

router.get('/', getFeedbacks);
router.get('/:id', getFeedback);

module.exports = router;