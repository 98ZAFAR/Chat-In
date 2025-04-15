const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const { createToken } = require("../utils/userUtils");

const handleRegisterUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All Fields Are Required!" });
        }

        const user = await User.findOne({ email });
        if (user) return res.status(402).json({ message: "User Already Exist!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({ message: "User Created Successfully!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server Error!" });
    }
};

const handleLoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All Fields Are Required!" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User Doesn't Exist!" });

        const check = await bcrypt.compare(password, user.password);
        if (check) {
            const token = createToken(user);
            return res.status(200).json({ message: "Logged In Successfully!", data: { token } });
        }
        else return res.status(400).json({ error: "Password Doesn't Match!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server Error!" });
    }
};

const handleUpdateUser = async(req, res)=>{
    try {
        const{username, email, avatarURL} = req.body;

        const user = await User.findOne({email});
        if (!user) return res.status(401).json({ message: "User Doesn't Exist!" });

        await User.updateOne({email}, {
            username:username||user.username,
            avatarURL:avatarURL||user.avatarURL
        })
        
        return res.status(201).json({message:"User Credentials Updated Successfully!"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server Error!" });
    }
}

module.exports = { handleRegisterUser, handleLoginUser, handleUpdateUser };