const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const { createToken } = require("../utils/userUtils");

// Validation helper functions
const validateEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateUsername = (username) => {
    return username && username.trim().length >= 2 && username.trim().length <= 30;
};

const handleRegisterUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                error: "All fields are required!", 
                details: "Username, email, and password must be provided" 
            });
        }

        if (!validateUsername(username)) {
            return res.status(400).json({ 
                error: "Invalid username!", 
                details: "Username must be between 2 and 30 characters" 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                error: "Invalid email format!", 
                details: "Please provide a valid email address" 
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                error: "Invalid password!", 
                details: "Password must be at least 6 characters long" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({ 
                error: "User already exists!", 
                details: "An account with this email already exists" 
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        return res.status(201).json({ 
            message: "User created successfully!", 
            data: { 
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    avatarURL: newUser.avatarURL
                }
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: "Email already exists!", 
                details: "An account with this email is already registered" 
            });
        }
        return res.status(500).json({ 
            error: "Server error!", 
            details: "Unable to create account. Please try again later." 
        });
    }
};

const handleLoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: "All fields are required!", 
                details: "Email and password must be provided" 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                error: "Invalid email format!", 
                details: "Please provide a valid email address" 
            });
        }

        // Find user and check password
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ 
                error: "Invalid credentials!", 
                details: "Email or password is incorrect" 
            });
        }

        // Check if user has a password (not just Google auth)
        if (!user.password) {
            return res.status(401).json({ 
                error: "Invalid login method!", 
                details: "This account uses Google authentication. Please sign in with Google." 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: "Invalid credentials!", 
                details: "Email or password is incorrect" 
            });
        }

        // Update user online status
        await User.findByIdAndUpdate(user._id, { 
            isOnline: true, 
            lastSeen: new Date() 
        });

        const token = createToken(user);
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatarURL: user.avatarURL,
            bio: user.bio,
            isOnline: true
        };

        return res.status(200).json({ 
            message: "Logged in successfully!", 
            data: { token, user: userResponse } 
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            error: "Server error!", 
            details: "Unable to sign in. Please try again later." 
        });
    }
};

const handleUpdateUser = async(req, res)=>{
    try {
        const { username, email, avatarURL, bio } = req.body;
        const userId = req.user._id; // Get from authenticated user

        // Input validation
        if (username && !validateUsername(username)) {
            return res.status(400).json({ 
                error: "Invalid username!", 
                details: "Username must be between 2 and 30 characters" 
            });
        }

        if (email && !validateEmail(email)) {
            return res.status(400).json({ 
                error: "Invalid email format!", 
                details: "Please provide a valid email address" 
            });
        }

        if (bio && bio.length > 150) {
            return res.status(400).json({ 
                error: "Bio too long!", 
                details: "Bio must be 150 characters or less" 
            });
        }

        // Check if email is already taken by another user
        if (email) {
            const emailExists = await User.findOne({ 
                email: email.toLowerCase().trim(), 
                _id: { $ne: userId } 
            });
            if (emailExists) {
                return res.status(409).json({ 
                    error: "Email already in use!", 
                    details: "This email is already associated with another account" 
                });
            }
        }

        // Build update object
        const updateData = {};
        if (username) updateData.username = username.trim();
        if (email) updateData.email = email.toLowerCase().trim();
        if (avatarURL) updateData.avatarURL = avatarURL;
        if (bio !== undefined) updateData.bio = bio.trim();

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                error: "User not found!", 
                details: "Unable to update user information" 
            });
        }

        return res.status(200).json({
            message: "User profile updated successfully!", 
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error("Update user error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: "Email already exists!", 
                details: "This email is already associated with another account" 
            });
        }
        return res.status(500).json({ 
            error: "Server error!", 
            details: "Unable to update profile. Please try again later." 
        });
    }
};

// New function to handle user logout
const handleLogoutUser = async(req, res) => {
    try {
        const userId = req.user._id;
        
        // Update user offline status
        await User.findByIdAndUpdate(userId, { 
            isOnline: false, 
            lastSeen: new Date() 
        });

        return res.status(200).json({ 
            message: "Logged out successfully!" 
        });

    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ 
            error: "Server error!", 
            details: "Unable to logout. Please try again later." 
        });
    }
};

// New function to get user profile
const handleGetUserProfile = async(req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ 
                error: "User not found!", 
                details: "Unable to retrieve user profile" 
            });
        }

        return res.status(200).json({ 
            message: "Profile retrieved successfully!", 
            data: { user } 
        });

    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ 
            error: "Server error!", 
            details: "Unable to retrieve profile. Please try again later." 
        });
    }
};

const handleGetOnlineUsers = async(req, res) => {
    try {
        const onlineUsers = await User.find({ isOnline: true })
            .select('_id username avatarURL isOnline lastSeen')
            .sort({ lastSeen: -1 });

        return res.status(200).json({
            message: "Online users retrieved successfully!",
            data: { onlineUsers }
        });

    } catch (error) {
        console.error("Get online users error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to retrieve online users. Please try again later."
        });
    }
};

module.exports = { 
    handleRegisterUser, 
    handleLoginUser, 
    handleUpdateUser, 
    handleLogoutUser, 
    handleGetUserProfile,
    handleGetOnlineUsers
};