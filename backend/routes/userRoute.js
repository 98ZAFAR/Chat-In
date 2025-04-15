const express = require('express');
const { handleRegisterUser, handleLoginUser, handleUpdateUser } = require('../controllers/userController');
const router = express.Router();

router.post("/signup", handleRegisterUser);
router.post("/signin", handleLoginUser);
router.put("/update", handleUpdateUser);

module.exports = router;