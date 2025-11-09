const Contact = require("../models/contactModel");
const User = require("../models/userModel");

const handleCreateContact = async(req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user._id;

        if (!email || !email.trim()) {
            return res.status(400).json({
                error: "Email is required!",
                details: "Please provide a valid email address"
            });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                error: "Invalid email format!",
                details: "Please provide a valid email address"
            });
        }

        // Check if user is trying to add themselves
        if (email.toLowerCase().trim() === req.user.email.toLowerCase()) {
            return res.status(400).json({
                error: "Cannot add yourself!",
                details: "You cannot add yourself as a contact"
            });
        }

        // Find the user to add as contact
        const contactUser = await User.findOne({email: email.toLowerCase().trim()});
        if (!contactUser) {
            return res.status(404).json({
                error: "User not found!",
                details: "No user found with this email address"
            });
        }

        // Check if contact already exists
        const existingContact = await Contact.findOne({
            userId: userId,
            contactId: contactUser._id
        });

        if (existingContact) {
            return res.status(409).json({
                error: "Contact already exists!",
                details: "This user is already in your contacts"
            });
        }

        // Create new contact
        const contact = await Contact.create({
            userId: userId,
            contactId: contactUser._id,
            contactName: contactUser.username,
            contactEmail: contactUser.email,
            contactAvatarURL: contactUser.avatarURL,
        });

        return res.status(201).json({
            message: "Contact added successfully!", 
            data: { contact }
        });

    } catch (error) {
        console.error("Add contact error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to add contact. Please try again later."
        });
    }
};

const handleFetchAllContacts = async(req, res) => {
    try {
        const userId = req.user._id; // Get from authenticated user instead of params

        const contacts = await Contact.find({userId})
            .sort({createdAt: -1});

        return res.status(200).json({
            message: "Contacts retrieved successfully!", 
            data: { contacts }
        });

    } catch (error) {
        console.error("Fetch contacts error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to retrieve contacts. Please try again later."
        });
    }
};

const handleDeleteContact = async(req, res) => {
    try {
        const { contactId } = req.params;
        const userId = req.user._id;

        if (!contactId) {
            return res.status(400).json({
                error: "Contact ID is required!",
                details: "Please provide a valid contact ID"
            });
        }

        const contact = await Contact.findOneAndDelete({
            userId: userId,
            contactId: contactId
        });

        if (!contact) {
            return res.status(404).json({
                error: "Contact not found!",
                details: "No contact found with this ID"
            });
        }

        return res.status(200).json({
            message: "Contact deleted successfully!"
        });

    } catch (error) {
        console.error("Delete contact error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to delete contact. Please try again later."
        });
    }
};

const handleSearchUsers = async(req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user._id;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                error: "Search query too short!",
                details: "Please provide at least 2 characters"
            });
        }

        const users = await User.find({
            _id: { $ne: userId }, // Exclude current user
            $or: [
                { username: { $regex: query.trim(), $options: 'i' } },
                { email: { $regex: query.trim(), $options: 'i' } }
            ]
        }).select('username email avatarURL isOnline').limit(10);

        return res.status(200).json({
            message: "Users found successfully!",
            data: { users }
        });

    } catch (error) {
        console.error("Search users error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to search users. Please try again later."
        });
    }
};

module.exports = {
    handleCreateContact, 
    handleFetchAllContacts, 
    handleDeleteContact, 
    handleSearchUsers
};