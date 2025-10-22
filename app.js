require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { Op } = require('sequelize')
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

app.use('/auth' , authRouter)
app.use(cartRouter)
app.use(messageRouter)
app.use(productRouter)

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Middleware error handler 
app.use(errorHandler)

// koneksi Socket.IO
io.on('connection', (socket) => { //harus di comment saat testing
    console.log('User connected:', socket.id)

    // Bergabung ke chat room 
    socket.on('join_room', (roomId) => {
        socket.join(roomId)
        console.log(`User ${socket.id} joined room ${roomId}`)
    })

    socket.on('send_message', async (data) => {
        try {
            const { senderId, content, roomId } = data

            // Valid Data
            if (!senderId || !content) {
                socket.emit('error', { message: 'Sender ID and content are required' })
                return
            }

            // Cek apakah pengirim ada
            const sender = await User.findByPk(senderId)
            if (!sender) {
                socket.emit('error', { message: 'Sender not found' })
                return
            }

            // Simpan pesan 
            const message = await Message.create({
                senderId,
                content
            })

            // Ambil data lengkap pesan  user
            const completeMessage = await Message.findByPk(message.id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'isAI']
                    }
                ]
            })

            // Broadcast pesan ke semua client yang terhubung (atau ke room tertentu)
            if (roomId) {
                io.to(roomId).emit('receive_message', completeMessage)
            } else {
                io.emit('receive_message', completeMessage)
            }

            console.log('Message sent:', completeMessage.content)
        } catch (error) {
            console.log(error)
            socket.emit('error', { message: 'Failed to send message', error: error.message })
        }
    })

    // Menangani permintaan pesan AI
    socket.on('request_ai', async (data) => {
        try {
            const { content, userId } = data

            if (!content) {
                socket.emit('error', { message: 'Message content is required' })
                return
            }

            // Kirim indikator kalo mengetik
            io.emit('ai_typing', { isTyping: true })

            // Hitung waktu 24 jam 
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

            // Ambil riwayat percakapan 24 jam terakhir
            const conversationHistory = await Message.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: twentyFourHoursAgo
                    }
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'isAI']
                    }
                ],
                order: [['createdAt', 'ASC']]
            })

            // Generate respons AI
            const aiResponse = await MessageController.generateAIResponse(
                content,
                conversationHistory
            )

            // Ambil atau buat AI per user
            const aiUser = await MessageController.getOrCreateAIUser()

            // Simpan respons AI ke database
            const aiMessage = await Message.create({
                senderId: aiUser.id,
                content: aiResponse
            })

            // Ambil data lengkap pesan AI dengan informasi user
            const completeAIMessage = await Message.findByPk(aiMessage.id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'isAI']
                    }
                ]
            })

            // Hentikan indikator sedang mengetik
            io.emit('ai_typing', { isTyping: false })

            // Broadcast respons AI ke semua client
            io.emit('receive_message', completeAIMessage)

            console.log('AI response sent:', completeAIMessage.content)
        } catch (error) {
            console.log(error)
            io.emit('ai_typing', { isTyping: false })
            socket.emit('error', { message: 'Failed to generate AI response', error: error.message })
        }
    })

    //indikator user mengetik
    socket.on('typing', (data) => {
        socket.broadcast.emit('user_typing', data)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})

if (process.env.NODE_ENV !== 'test') {//harus di comment saat testing
    httpServer.listen(port, () => {
        console.log(`Server running on port ${port}`)
        console.log(`Socket.IO server ready`)
    })
} 

module.exports = { app, httpServer, io }
