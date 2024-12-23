const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

// Define routes
router.get('/messages', messageController.getMessages);
router.delete('/messages', messageController.clearMessages); // Add clear endpoint
// Remove or comment out the POST route since we're not using it
// router.post('/messages', messageController.createMessage);

module.exports = router;
