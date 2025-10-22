const { Message, User } = require('../models')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { APP_KNOWLEDGE_BASE, AI_SYSTEM_PROMPT } = require('../config/aiKnowledgeBase')

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY')

class MessageController {
    // Mengambil semua pesan dari percakapan
    static async getAllMessages(req, res, next) {
        try {
            // Ambil semua pesan dengan informasi user
            const messages = await Message.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'isAI']
                    }
                ],
                order: [['createdAt', 'ASC']]
            })

            res.status(200).json({ messages })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    // Membuat pesan baru dari user 
    static async createMessage(req, res, next) {
        try {
            const { content } = req.body


            const senderId = req.user?.id
            if (!senderId) {
                throw { name: 'Unauthorized', message: 'Please login to send messages' }
            }

            // Validasi isi pesan
            if (!content) {
                throw { name: 'BadRequest', message: 'Message content is required' }
            }

            // Cek apakah pengirim ada di database (safety)
            const sender = await User.findByPk(senderId)
            if (!sender) {
                throw { name: 'NotFound', message: 'Sender not found' }
            }

            // Buat pesan baru
            const message = await Message.create({
                senderId,
                content
            })

            // Ambil data lengkap pesan dengan informasi user
            const completeMessage = await Message.findByPk(message.id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'isAI']
                    }
                ]
            })

            res.status(201).json({ 
                message: 'Message created successfully', 
                data: completeMessage 
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    // Generate respons AI menggunakan Gemini dengan Knowledge Base
    static async generateAIResponse(userMessage, conversationHistory = []) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash',
                generationConfig: {
                    maxOutputTokens: 1024,
                }
            })

            // knowledge base untuk AI
            const knowledgeContext = `
KNOWLEDGE BASE APLIKASI:

${AI_SYSTEM_PROMPT}

INFORMASI DETAIL:

PROSES REGISTRASI:
${APP_KNOWLEDGE_BASE.authentication.registration.process.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Masalah Umum Registrasi:
${APP_KNOWLEDGE_BASE.authentication.registration.common_issues.map(issue => `- ${issue}`).join('\n')}

PROSES LOGIN:
${APP_KNOWLEDGE_BASE.authentication.login.process.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Masalah Umum Login:
${APP_KNOWLEDGE_BASE.authentication.login.common_issues.map(issue => `- ${issue}`).join('\n')}

FITUR PRODUK:
${APP_KNOWLEDGE_BASE.products.features.browse.description}
Informasi yang ditampilkan: ${APP_KNOWLEDGE_BASE.products.features.browse.information_displayed.join(', ')}
Manajemen Stok: ${APP_KNOWLEDGE_BASE.products.stock_management}

KERANJANG BELANJA:
Cara Tambah ke Keranjang:
${APP_KNOWLEDGE_BASE.cart.features.add_to_cart.process.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Persyaratan: ${APP_KNOWLEDGE_BASE.cart.features.add_to_cart.requirements.join(', ')}

ALUR PENGGUNA BARU:
${APP_KNOWLEDGE_BASE.user_flows.first_time_buyer.map((step, i) => `${i + 1}. ${step}`).join('\n')}

FAQ:
${APP_KNOWLEDGE_BASE.faq.account.map(item => `P: ${item.q}\nJ: ${item.a}`).join('\n\n')}
`

            // Bangun prompt dengan riwayat percakapan
            let prompt = `${knowledgeContext}\n\nCONVERSATION HISTORY:\n`
            
            // Ambil 5 pesan terakhir 
            const recentHistory = conversationHistory.slice(-5)
            recentHistory.forEach(msg => {
                const role = msg.User?.isAI ? 'Assistant' : 'Customer'
                prompt += `${role}: ${msg.content}\n`
            })
            
            prompt += `\nCustomer: ${userMessage}\n\n`
            prompt += `Provide a helpful and concise answer based on the knowledge base above. `
            prompt += `Use step-by-step format when explaining processes. Be friendly and supportive. `
            prompt += `IMPORTANT: Answer WITHOUT using emojis, special symbols, or Unicode characters. `
            prompt += `Use natural and easy-to-understand English like a human conversation.\n\n`
            prompt += `Assistant:`

            // Generate respons dari AI
            const result = await model.generateContent(prompt)
            const response = await result.response
            let aiReply = response.text()

            // Bersihkan response dari emoji dan karakter khusus
            aiReply = aiReply
                .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
                .replace(/[\u{2600}-\u{26FF}]/gu, '')
                .replace(/[\u{2700}-\u{27BF}]/gu, '')
                .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
                .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
                .replace(/[✓✔✅❌⚠️⭐]/g, '')
                .replace(/\s+/g, ' ')
                .trim()

            return aiReply
        } catch (error) {
            console.log(error)
            return "Sorry, I'm experiencing connection issues at the moment. I'm here to help with questions about registration and login, browsing products, adding items to cart, managing shopping cart, as well as account and technical issues. Please try asking your question again, or contact our support team for direct assistance."
        }
    }

    // Mengambil atau membuat AI user untuk respons otomatis
    static async getOrCreateAIUser() {
        try {
            // Cari AI user yang sudah ada
            let aiUser = await User.findOne({
                where: { isAI: true }
            })

            // Buat AI user baru jika belum ada
            if (!aiUser) {
                aiUser = await User.create({
                    name: 'Support Assistant',
                    email: 'support@ai-assistant.com',
                    password: 'secure_ai_password_not_used_for_login',
                    isAI: true
                })
                console.log('AI Support Assistant created successfully')
            }

            return aiUser
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    // ambil saran quick help untuk membantu lebi cepat 
    static async getQuickHelp(req, res, next) {
        try {
            // Daftar topik bantuan cepat yang sering ditanyakan
            const quickHelpTopics = [
                {
                    id: 1,
                    category: "Getting Started",
                    topics: [
                        "How do I create an account?",
                        "How do I login to my account?",
                        "I forgot my password, what should I do?"
                    ]
                },
                {
                    id: 2,
                    category: "Shopping",
                    topics: [
                        "How do I browse products?",
                        "How do I add items to cart?",
                        "How do I remove items from cart?",
                        "What if a product is out of stock?"
                    ]
                },
                {
                    id: 3,
                    category: "Account Issues",
                    topics: [
                        "Why can't I login?",
                        "Can I change my email address?",
                        "Is my information secure?"
                    ]
                },
                {
                    id: 4,
                    category: "Technical Support",
                    topics: [
                        "Website is not loading properly",
                        "How do I contact support?",
                        "Can I use the app on mobile?"
                    ]
                }
            ]

            res.status(200).json({
                quickHelp: quickHelpTopics,
                appInfo: {
                    name: APP_KNOWLEDGE_BASE.appName,
                    type: APP_KNOWLEDGE_BASE.appType,
                    supportAvailable: "24/7 AI Support and Support Team"
                }
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    // Handle permintaan respons AI 
    static async requestAIResponse(req, res, next) {
        try {
            const { content, userId } = req.body

            // Validasi isi pesan 
            if (!content) {
                throw { name: "BadRequest", message: "Message content is required" }
            }

            // Ambil riwayat percakapan terakhir untuk konteks AI
            const conversationHistory = await Message.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'isAI']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 10
            })

            conversationHistory.reverse()

            // Generate respons AI berdasarkan pertanyaan dan riwayat
            const aiResponse = await MessageController.generateAIResponse(
                content,
                conversationHistory
            )

            // Dapatkan atau buat AI user
            const aiUser = await MessageController.getOrCreateAIUser()

            // Simpan respons AI sebagai pesan baru
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

            res.status(201).json({ 
                message: 'AI response generated successfully', 
                data: completeAIMessage 
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    // hapus pesan dari percakapan
    static async deleteMessage(req, res, next) {
        try {
            const { id } = req.params

            // Cari pesan berdasarkan ID
            const message = await Message.findByPk(id)
            if (!message) {
                throw { name: 'NotFound', message: 'Message not found' }
            }

            // Hanya sender yang bisa menghapus pesannya
            const requesterId = req.user?.id
            if (!requesterId) {
                throw { name: 'Unauthorized', message: 'Please login' }
            }

            if (message.senderId !== requesterId) {
                throw { name: 'Forbidden', message: 'You are not allowed to delete this message' }
            }

            // Hapus pesan dari database
            await message.destroy()

            res.status(200).json({ message: 'Message deleted successfully' })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}

module.exports = MessageController
