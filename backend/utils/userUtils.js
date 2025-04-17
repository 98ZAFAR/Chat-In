const jwt = require("jsonwebtoken");

const createToken = (user) => {
    const payload = {
        _id:user._id,
        username: user.username,
        email: user.email,
        avatarURL: user.avatarURL,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY);

    return token;
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY);
};

module.exports = { createToken, verifyToken };
