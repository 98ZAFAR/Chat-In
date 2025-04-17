const express = require('express');
const { handleFetchUserMessages } = require('../controllers/messageController');
const router = express.Router();

router.get('/fetch/:userId', handleFetchUserMessages);

module.exports = router;