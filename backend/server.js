require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connectDB} = require('./config/dbConnection.js');

const userRoute = require('./routes/userRoute.js');
const contactRoute = require('./routes/contactRoute.js');
const messageRoute = require('./routes/messageRoute.js');

const ValidateUser = require('./middlewares/validateUser.js');
const Message = require('./models/messageModel.js');

const { verifyToken } = require('./utils/userUtils.js');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB(process.env.MongoURI);

app.use(cors({
    origin:`${process.env.FRONTEND_URL}`,
    methods:["POST", "PUT", "DELETE", "GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials:true
}));

app.use(express.json());

app.use('/api/auth/', userRoute);
app.use('/api/contacts/', ValidateUser, contactRoute);
app.use('/api/messages/', ValidateUser, messageRoute);


//--------SOCKET IMPLEMENTATION---------//
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods:["GET", "POST"],
        credentials: true
    }
});

const connectedUsers = new Map();

io.use((socket, next)=>{
    const token = socket.handshake.auth.token;
    if(!token) return next(new Error("No token found!"));

    try {
        const user = verifyToken(token);
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
});

io.on("connection", (socket)=>{
    const userId = socket.user._id;
    connectedUsers.set(userId, socket.id);

    console.log("User Connected "+userId);

    socket.on('send_message', async({to, content})=>{
        if(!to||!content) return;

        const newMessage = await Message.create({
            sender:userId,
            reciever:to,
            content
        });

        const receiverSocketId = connectedUsers.get(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('recieve_message', {
                from: userId,
                content,
                timestamp: newMessage.timestamp
            });
        }
    })

    socket.on('disconnect', () => {
        connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
    });
});

server.listen(PORT, ()=>{
    console.log("Server is runnig on port "+PORT);
})