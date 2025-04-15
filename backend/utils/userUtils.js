const jwt = require("jsonwebtoken");

const createToken = (user) => {
    const payload = {
        username: user.username,
        email: user.email,
        avatarURL: user.avatarURL,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY);

    return token;
};

const verifyToken = (token) => {
    return token ? jwt.verify(token, process.env.SECRET_KEY) : null;
};

module.exports = { createToken, verifyToken };
