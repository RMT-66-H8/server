const express = require('express');
const MessageController = require('../controllers/MessageController');
const router = express.Router();


router.get('/messages', MessageController.getAllMessages);
router.get('/messages/quick-help', MessageController.getQuickHelp);
router.post('/messages', MessageController.createMessage);
router.post('/messages/ai', MessageController.requestAIResponse);
router.delete('/messages/:id', MessageController.deleteMessage);

module.exports = router;
