require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/dbConnection.js');

const userRoute = require('./routes/userRoute.js');
const contactRoute = require('./routes/contactRoute.js');
const messageRoute = require('./routes/messageRoute.js');

const ValidateUser = require('./middlewares/validateUser.js');
const { generalLimiter, authLimiter } = require('./middlewares/rateLimiter.js');
const Message = require('./models/messageModel.js');
const User = require('./models/userModel.js');

const { verifyToken, createToken } = require('./utils/userUtils.js');
const { Server } = require('socket.io');
const http = require('http');

const expressSession = require('express-session')
const passport = require('passport');
require('./auth/googleStrategy.js');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB(process.env.MongoURI);

app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["POST", "PUT", "DELETE", "GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api/', generalLimiter);

//----------GOOGLE AUTHENTICATION----------//
app.use(
    expressSession({
        secret: process.env.COOKIE_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        const token = createToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/chat?token=${token}`);
    }
);

app.get('/api/current_user/:token', (req, res) => {
    try {
        const token = req.params.token;
        const user = verifyToken(token);

        return res.status(200).json({user})
    } catch (error) {
        console.log(error);
    }
});
app.get('/api/logout', (req, res) => { req.logout(); res.redirect(process.env.FRONTEND_URL); });

//----------LOCAL AUTHENTICATION----------//
app.use('/api/auth/', authLimiter, userRoute);

app.use('/api/contacts/', ValidateUser, contactRoute);
app.use('/api/messages/', ValidateUser, messageRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        details: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: error.message
        });
    }
    
    if (error.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
            details: 'The provided ID is not valid'
        });
    }
    
    if (error.code === 11000) {
        return res.status(409).json({
            error: 'Duplicate entry',
            details: 'A record with this data already exists'
        });
    }
    
    res.status(500).json({
        error: 'Internal server error',
        details: 'Something went wrong on the server'
    });
});


//--------SOCKET IMPLEMENTATION---------//
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const connectedUsers = new Map();
const typingUsers = new Map();

// Rate limiting for socket events
const messageRateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 30;

const checkRateLimit = (userId) => {
    const now = Date.now();
    const userLimits = messageRateLimit.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    
    if (now > userLimits.resetTime) {
        messageRateLimit.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }
    
    if (userLimits.count >= MAX_MESSAGES_PER_WINDOW) {
        return false;
    }
    
    userLimits.count++;
    messageRateLimit.set(userId, userLimits);
    return true;
};

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token found!"));

    try {
        const user = verifyToken(token);
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
});

io.on("connection", async (socket) => {
    const userId = socket.user._id;
    const username = socket.user.username;
    
    connectedUsers.set(userId, socket.id);

    // Update user online status
    try {
        await User.findByIdAndUpdate(userId, { 
            isOnline: true, 
            lastSeen: new Date() 
        });
    } catch (error) {
        console.error("Error updating online status:", error);
    }

    console.log(`User Connected: ${username} (${userId})`);

    // Send current online users to the newly connected user
    try {
        const onlineUsers = await User.find({ isOnline: true })
            .select('_id username avatarURL isOnline lastSeen');
        
        socket.emit('online_users_list', {
            onlineUsers: onlineUsers.map(user => ({
                userId: user._id,
                username: user.username,
                avatarURL: user.avatarURL,
                isOnline: user.isOnline
            }))
        });
    } catch (error) {
        console.error("Error fetching online users:", error);
    }

    // Emit user online status to all connected users (including the newly connected one)
    io.emit('user_online', {
        userId: userId,
        username: username,
        isOnline: true
    });

    // Handle sending messages
    socket.on('send_message', async ({ to, content, messageType = 'text' }) => {
        try {
            // Input validation
            if (!to || !content || content.trim().length === 0) {
                socket.emit('message_error', { error: 'Invalid message data' });
                return;
            }

            if (content.length > 1000) {
                socket.emit('message_error', { error: 'Message too long' });
                return;
            }

            // Rate limiting
            if (!checkRateLimit(userId)) {
                socket.emit('message_error', { error: 'Rate limit exceeded. Please slow down.' });
                return;
            }

            // Create message in database
            const newMessage = await Message.create({
                sender: userId,
                receiver: to,
                content: content.trim(),
                messageType: messageType
            });

            // Populate sender information
            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender receiver', 'username avatarURL');

            const messageData = {
                _id: populatedMessage._id,
                sender: populatedMessage.sender,
                receiver: populatedMessage.receiver,
                content: populatedMessage.content,
                messageType: populatedMessage.messageType,
                isRead: populatedMessage.isRead,
                createdAt: populatedMessage.createdAt,
                updatedAt: populatedMessage.updatedAt
            };

            // Send to receiver if online
            const receiverSocketId = connectedUsers.get(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', messageData);
            }

            // Confirm message sent to sender
            socket.emit('message_sent', messageData);

        } catch (error) {
            console.error("Send message error:", error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });

    // Handle typing indicators
    socket.on('typing_start', ({ to }) => {
        if (!to) return;
        
        const receiverSocketId = connectedUsers.get(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_typing', {
                userId: userId,
                username: username,
                isTyping: true
            });
        }
        
        // Set typing timeout
        if (typingUsers.has(userId)) {
            clearTimeout(typingUsers.get(userId));
        }
        
        const timeout = setTimeout(() => {
            const receiverSocketId = connectedUsers.get(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', {
                    userId: userId,
                    username: username,
                    isTyping: false
                });
            }
            typingUsers.delete(userId);
        }, 3000);
        
        typingUsers.set(userId, timeout);
    });

    socket.on('typing_stop', ({ to }) => {
        if (!to) return;
        
        if (typingUsers.has(userId)) {
            clearTimeout(typingUsers.get(userId));
            typingUsers.delete(userId);
        }
        
        const receiverSocketId = connectedUsers.get(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_typing', {
                userId: userId,
                username: username,
                isTyping: false
            });
        }
    });

    // Handle message read status
    socket.on('mark_message_read', async ({ messageId }) => {
        try {
            if (!messageId) return;

            const message = await Message.findByIdAndUpdate(
                messageId,
                { isRead: true, readAt: new Date() },
                { new: true }
            );

            if (message) {
                const senderSocketId = connectedUsers.get(message.sender.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit('message_read', {
                        messageId: messageId,
                        readAt: message.readAt
                    });
                }
            }
        } catch (error) {
            console.error("Mark message read error:", error);
        }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
        connectedUsers.delete(userId);
        
        // Clear typing timeout
        if (typingUsers.has(userId)) {
            clearTimeout(typingUsers.get(userId));
            typingUsers.delete(userId);
        }

        // Update user offline status
        try {
            await User.findByIdAndUpdate(userId, { 
                isOnline: false, 
                lastSeen: new Date() 
            });
        } catch (error) {
            console.error("Error updating offline status:", error);
        }

        // Emit user offline status to all connected users
        io.emit('user_online', {
            userId: userId,
            username: username,
            isOnline: false,
            lastSeen: new Date()
        });

        console.log(`User disconnected: ${username} (${userId})`);
    });
});

server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});