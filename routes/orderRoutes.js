const express = require('express');
const router = express.Router();
const { getOrders, getOrder } = require('../controllers/orderController');

router.get('/', getOrders);
router.get('/:id', getOrder);

module.exports = router;