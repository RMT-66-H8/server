const express = require('express');
const AuthController = require('../controllers/AuthController');
const authentication = require('../middlewares/authentication');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/users', authentication, AuthController.getAllUsers);

module.exports = router;