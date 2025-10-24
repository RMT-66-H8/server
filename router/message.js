const express = require('express');
const MessageController = require('../controllers/MessageController');
const authentication = require('../middlewares/authentication');
const router = express.Router();

// Semua endpoint message memerlukan authentication
router.get('/messages', authentication, MessageController.getAllMessages);
router.get('/messages/quick-help', authentication, MessageController.getQuickHelp);
router.post('/messages', authentication, MessageController.createMessage);
router.post('/messages/ai', authentication, MessageController.requestAIResponse);
router.delete('/messages/:id', authentication, MessageController.deleteMessage);

module.exports = router;
