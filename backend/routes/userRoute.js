const express = require('express');
const router = express.Router();
const { handleRegisterUser, handleLoginUser, handleUpdateUser } = require('../controllers/userController');

router.post("/signup", handleRegisterUser);
router.post("/signin", handleLoginUser);
router.put("/update", handleUpdateUser);

module.exports = router;