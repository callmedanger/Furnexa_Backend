const express = require('express');
const router = express.Router();
const { getNotifications, getNotification } = require('../controllers/notificationController');

router.get('/', getNotifications);
router.get('/:id', getNotification);

module.exports = router;