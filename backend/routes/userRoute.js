const express = require('express');
const router = express.Router();
const ValidateUser = require('../middlewares/validateUser');
const { 
    handleRegisterUser, 
    handleLoginUser, 
    handleUpdateUser, 
    handleLogoutUser, 
    handleGetUserProfile,
    handleGetOnlineUsers
} = require('../controllers/userController');

router.post("/signup", handleRegisterUser);
router.post("/signin", handleLoginUser);
router.put("/update", ValidateUser, handleUpdateUser);
router.post("/logout", ValidateUser, handleLogoutUser);
router.get("/profile", ValidateUser, handleGetUserProfile);
router.get("/online-users", ValidateUser, handleGetOnlineUsers);

module.exports = router;