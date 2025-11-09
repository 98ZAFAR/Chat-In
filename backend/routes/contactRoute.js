const express = require('express');
const { 
    handleCreateContact, 
    handleFetchAllContacts, 
    handleDeleteContact, 
    handleSearchUsers 
} = require('../controllers/contactController');
const router = express.Router();

router.post('/create', handleCreateContact);
router.get('/fetch', handleFetchAllContacts);
router.delete('/delete/:contactId', handleDeleteContact);
router.get('/search', handleSearchUsers);

module.exports = router;