require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cartRouter = require('./router/cart')
const messageRouter = require('./router/message')
const { Message, User } = require('./models')
const MessageController = require('./controllers/MessageController')
const errorHandler = require('./middlewares/errorHandler')
const productRouter = require('./router/product')
const authRouter = require("./router/auth")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
})

const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

// Make io accessible to req object
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/auth', authRouter)
app.use(cartRouter)
app.use(messageRouter)
app.use(productRouter)

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Middleware error handler 
app.use(errorHandler)

// Track online users: Map<userId, { socketId, name, email }>
const onlineUsers = new Map();

// Helper function to generate private room ID for 1-on-1 chat
function getPrivateRoomId(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b);
    return `private_${sortedIds[0]}_${sortedIds[1]}`;
}

io.on('connection', (socket) => { //harus di comment saat testing
    console.log('🔌 Socket connected:', socket.id)

    // User joins with authentication
    socket.on('user:join', (userData) => {
        const { userId, name, email } = userData;
        if (userId && name && email) {
            // Replace old session if user reconnects
            if (onlineUsers.has(userId)) {
                const oldSocketId = onlineUsers.get(userId).socketId;
                console.log(`⚠️  User ${name} reconnected. Old socket: ${oldSocketId}`);
            }
            
            onlineUsers.set(userId, { socketId: socket.id, name, email });
            socket.userId = userId;
            
            console.log(`👤 User joined: ${name} (ID: ${userId})`);
            console.log(`📊 Online users: ${onlineUsers.size}`);
            
            // Broadcast online users list
            const usersList = Array.from(onlineUsers.entries()).map(([id, data]) => ({
                userId: id,
                name: data.name,
                email: data.email
            }));
            io.emit('users:online', usersList);
            
            socket.emit('user:connected', { userId, name, email });
        }
    });

    // Join private 1-on-1 chat room
    socket.on('chat:join', ({ userId1, userId2 }) => {
        const roomId = getPrivateRoomId(userId1, userId2);
        socket.join(roomId);
        console.log(`💬 User ${socket.userId} joined private room: ${roomId}`);
        socket.emit('chat:joined', { roomId });
    });

    // Leave chat room
    socket.on('chat:leave', ({ roomId }) => {
        socket.leave(roomId);
        console.log(`🚪 User ${socket.userId} left room: ${roomId}`);
    });

    // Send private message (1-on-1 ONLY)
    socket.on('message:send', async (data) => {
        try {
            const { senderId, receiverId, content } = data;

            if (!senderId || !receiverId || !content) {
                socket.emit('error', { message: 'Sender ID, receiver ID, and content are required' });
                return;
            }

            const sender = await User.findByPk(senderId);
            if (!sender) {
                socket.emit('error', { message: 'Sender not found' });
                return;
            }

            const receiver = await User.findByPk(receiverId);
            if (!receiver) {
                socket.emit('error', { message: 'Receiver not found' });
                return;
            }

            // Save message to database with receiverId
            const message = await Message.create({
                senderId,
                receiverId,
                content
            });

            const completeMessage = await Message.findByPk(message.id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'isAI']
                    }
                ]
            });

            const roomId = getPrivateRoomId(senderId, receiverId);
            const messageData = {
                ...completeMessage.toJSON(),
                receiverId,
                roomId
            };

            // Send to sender (confirmation)
            socket.emit('message:sent', messageData);

            // Send to receiver if online
            const receiverData = onlineUsers.get(receiverId);
            if (receiverData) {
                io.to(receiverData.socketId).emit('message:received', messageData);
            }

            console.log(`📨 ${sender.name} → ${receiver.name}: ${content.substring(0, 30)}...`);
        } catch (error) {
            console.log(error);
            socket.emit('error', { message: 'Failed to send message', error: error.message });
        }
    });

    // Request AI assistance (private only)
    socket.on('ai:request', async (data) => {
        try {
            const { content, userId } = data;

            if (!content) {
                socket.emit('error', { message: 'Message content is required' });
                return;
            }

            socket.emit('ai:typing', { isTyping: true });

            // Get conversation history (user's private messages with AI)
            const aiUser = await MessageController.getOrCreateAIUser();
            const conversationHistory = await Message.findAll({
                where: {
                    [Op.or]: [
                        { senderId: userId, receiverId: aiUser.id },
                        { senderId: aiUser.id, receiverId: userId }
                    ]
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'isAI']
                    }
                ],
                order: [['createdAt', 'ASC']],
                limit: 10
            });

            // Generate AI response
            const aiResponse = await MessageController.generateAIResponse(
                content,
                conversationHistory
            );

            // Save AI message with receiverId
            const aiMessage = await Message.create({
                senderId: aiUser.id,
                receiverId: userId,
                content: aiResponse
            });

            const completeAIMessage = await Message.findByPk(aiMessage.id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'isAI']
                    }
                ]
            });

            socket.emit('ai:typing', { isTyping: false });
            socket.emit('ai:response', completeAIMessage);

            console.log(`🤖 AI → User ${userId}: ${aiResponse.substring(0, 30)}...`);
        } catch (error) {
            console.log(error);
            socket.emit('ai:typing', { isTyping: false });
            socket.emit('error', { message: 'Failed to generate AI response', error: error.message });
        }
    });

    // Typing indicator (1-on-1)
    socket.on('typing:start', ({ receiverId }) => {
        const receiverData = onlineUsers.get(receiverId);
        if (receiverData) {
            io.to(receiverData.socketId).emit('typing:status', {
                userId: socket.userId,
                isTyping: true
            });
        }
    });

    socket.on('typing:stop', ({ receiverId }) => {
        const receiverData = onlineUsers.get(receiverId);
        if (receiverData) {
            io.to(receiverData.socketId).emit('typing:status', {
                userId: socket.userId,
                isTyping: false
            });
        }
    });

    // Get online users
    socket.on('users:get', () => {
        const usersList = Array.from(onlineUsers.entries()).map(([id, data]) => ({
            userId: id,
            name: data.name,
            email: data.email
        }));
        socket.emit('users:online', usersList);
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            const userData = onlineUsers.get(socket.userId);
            if (userData) {
                console.log(`👋 User disconnected: ${userData.name} (ID: ${socket.userId})`);
                onlineUsers.delete(socket.userId);
                console.log(`📊 Online users: ${onlineUsers.size}`);
                
                const usersList = Array.from(onlineUsers.entries()).map(([id, data]) => ({
                    userId: id,
                    name: data.name,
                    email: data.email
                }));
                io.emit('users:online', usersList);
                io.emit('user:disconnected', { userId: socket.userId, name: userData.name });
            }
        } else {
            console.log('🔌 Socket disconnected:', socket.id);
        }
    });
})

if (process.env.NODE_ENV !== 'test') {//harus di comment saat testing
    httpServer.listen(port, () => {
        console.log(`Server running on port ${port}`)
        console.log(`Socket.IO server ready - 1-on-1 Private Chat Only`)
    })
} 

module.exports = { app, httpServer, io }
