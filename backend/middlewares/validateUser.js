const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/userUtils');

const ValidateUser = ()=>{
    return (req, res, next)=>{
        const authHeaders = req.headers['authorizarion'];
        const token = authHeaders && authHeaders.split(' ')[1];

        try {
            if(!token){
                res.status(400).json({error:"Token Not Found!"});
                return next();
            }

            const user = verifyToken(token);
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Server Error!"});
        }
    }
};

module.exports = ValidateUser;