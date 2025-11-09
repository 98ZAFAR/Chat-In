const Message = require("../models/messageModel");
const User = require("../models/userModel");
const mongoose = require('mongoose');

const handleFetchUserMessages = async(req, res) => {
    try {
        const userId = req.user._id; // Get from authenticated user and create ObjectId

        const messages = await Message.find({
            $or: [
                { receiver: userId },
                { sender: userId }
            ]
        }).populate('sender receiver', 'username avatarURL')
          .sort({ createdAt: 1 });

        return res.status(200).json({
            message: "Messages retrieved successfully", 
            data: { messages }
        });

    } catch (error) {
        console.error("Fetch messages error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to retrieve messages. Please try again later."
        });
    }
};

const handleFetchConversation = async(req, res) => {
    try {
        const { contactId } = req.params;
        
        // Validate user ID from token
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                error: "User not authenticated!",
                details: "Please login to continue"
            });
        }
        
        const userId = req.user._id;
        const { page = 1, limit = 50 } = req.query;

        if (!contactId) {
            return res.status(400).json({
                error: "Contact ID is required!",
                details: "Please provide a valid contact ID"
            });
        }

        const contactObjectId = contactId;
        console.log("Fetching conversation between", userId, "and", contactObjectId);
        const contact = await User.findById(contactObjectId);
        if (!contact) {
            return res.status(404).json({
                error: "Contact not found!",
                details: "No user found with this ID"
            });
        }

        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: contactObjectId },
                { sender: contactObjectId, receiver: userId }
            ]
        }).populate('sender receiver', 'username avatarURL')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));

        // Reverse to get chronological order
        messages.reverse();

        return res.status(200).json({
            message: "Conversation retrieved successfully",
            data: { 
                messages,
                hasMore: messages.length === parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Fetch conversation error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to retrieve conversation. Please try again later."
        });
    }
};

const handleMarkMessagesAsRead = async(req, res) => {
    try {
        const { contactId } = req.params;
        
        // Validate user ID from token
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                error: "User not authenticated!",
                details: "Please login to continue"
            });
        }
        
        const userId = req.user._id;

        if (!contactId) {
            return res.status(400).json({
                error: "Contact ID is required!",
                details: "Please provide a valid contact ID"
            });
        }

        // Create proper ObjectId instances for MongoDB query
        const senderObjectId = contactId;
        const receiverObjectId = userId;

        // console.log("Marking messages as read from", contactId, "to", userId);
        const result = await Message.updateMany(
            {
                sender: senderObjectId,
                receiver: receiverObjectId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        return res.status(200).json({
            message: "Messages marked as read successfully",
            data: { modifiedCount: result.modifiedCount }
        });

    } catch (error) {
        console.error("Mark messages as read error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to mark messages as read. Please try again later."
        });
    }
};

const handleDeleteMessage = async(req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;
        // Validate user ID from token
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                error: "User not authenticated!",
                details: "Please login to continue"
            });
        }


        const messageObjectId = messageId;
        const message = await Message.findOneAndDelete({
            _id: messageObjectId,
            sender: userId // Only allow sender to delete their own messages
        });

        if (!message) {
            return res.status(404).json({
                error: "Message not found!",
                details: "No message found with this ID or you don't have permission to delete it"
            });
        }

        return res.status(200).json({
            message: "Message deleted successfully"
        });

    } catch (error) {
        console.error("Delete message error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to delete message. Please try again later."
        });
    }
};

const handleGetUnreadCount = async(req, res) => {
    try {
        const userId = req.user._id;

        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    receiver: userId,
                    isRead: false
                }
            },
            {
                $group: {
                    _id: "$sender",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $unwind: "$sender"
            },
            {
                $project: {
                    senderId: "$_id",
                    senderName: "$sender.username",
                    senderAvatar: "$sender.avatarURL",
                    count: 1
                }
            }
        ]);

        const totalUnread = unreadCounts.reduce((sum, item) => sum + item.count, 0);

        return res.status(200).json({
            message: "Unread counts retrieved successfully",
            data: { 
                unreadCounts,
                totalUnread
            }
        });

    } catch (error) {
        console.error("Get unread count error:", error);
        return res.status(500).json({
            error: "Server error!",
            details: "Unable to retrieve unread counts. Please try again later."
        });
    }
};

module.exports = {
    handleFetchUserMessages,
    handleFetchConversation,
    handleMarkMessagesAsRead,
    handleDeleteMessage,
    handleGetUnreadCount
};