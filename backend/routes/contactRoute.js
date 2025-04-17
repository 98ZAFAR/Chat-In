const express = require('express');
const { handleCreateContact, handleFetchAllContacts } = require('../controllers/contactController');
const router = express.Router();

router.post('/create', handleCreateContact);
router.get('/fetch/:userId', handleFetchAllContacts);

module.exports = router;