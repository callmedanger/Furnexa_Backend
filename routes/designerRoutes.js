const express = require('express');
const router = express.Router();
const { getDesigners, addDesigner, toggleAvailability, removeDesigner } = require('../controllers/designerController');

router.get('/', getDesigners);
router.post('/', addDesigner);
router.patch('/:id/availability', toggleAvailability);
router.delete('/:id', removeDesigner);

module.exports = router;