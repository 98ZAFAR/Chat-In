const express = require('express');
const { 
    handleFetchUserMessages,
    handleFetchConversation,
    handleMarkMessagesAsRead,
    handleDeleteMessage,
    handleGetUnreadCount
} = require('../controllers/messageController');
const router = express.Router();

router.get('/fetch', handleFetchUserMessages);
router.get('/conversation/:contactId', handleFetchConversation);
router.put('/mark-read/:contactId', handleMarkMessagesAsRead);
router.delete('/delete/:messageId', handleDeleteMessage);
router.get('/unread-count', handleGetUnreadCount);

module.exports = router;