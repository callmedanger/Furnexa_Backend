const express = require('express');
const router = express.Router();
const { getProducts, getProduct, removeProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.delete('/:id', removeProduct);

module.exports = router;