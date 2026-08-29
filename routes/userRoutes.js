const express = require('express');
const router = express.Router();
const { getUsers, getUser, removeUser } = require('../controllers/userController');

router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', removeUser);

module.exports = router;