const express = require('express');
const router = express.Router();
const { sendBulkEmail, getEmailLogs } = require('../controllers/emailController');

router.post('/send-bulk', sendBulkEmail);
router.get('/logs', getEmailLogs);

module.exports = router;