const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/userUtils');

function ValidateUser(req, res, next){
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        console.error("Token validation error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token." });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired." });
        }
        return res.status(500).json({ error: "Server Error!" });
    }
};

module.exports = ValidateUser;