const express = require('express');
const router = express.Router();
const { getRiders, addRider, toggleAvailability, removeRider } = require('../controllers/riderController');

router.get('/', getRiders);
router.post('/', addRider);
router.patch('/:id/availability', toggleAvailability);
router.delete('/:id', removeRider);

module.exports = router;