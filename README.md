# E-Commerce Platform with AI Support - Server

Backend server untuk E-Commerce Platform dengan fitur AI Support Assistant menggunakan Socket.IO dan Google Gemini AI.

## Features

- 🔐 User Authentication (Registration & Login)
- 🛍️ Product Management
- 🛒 Shopping Cart
- 💬 Real-time Messaging dengan Socket.IO
- 🤖 AI Support Assistant dengan Google Gemini
- 📚 Knowledge Base untuk AI Support

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL/MySQL (via Sequelize ORM)
- **Real-time:** Socket.IO
- **AI:** Google Gemini AI
- **Authentication:** bcrypt

## Prerequisites

- Node.js (v14 atau lebih tinggi)
- npm atau yarn
- PostgreSQL atau MySQL database
- Google Gemini API Key

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` ke `.env` dan isi dengan konfigurasi Anda:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Gemini AI API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Cara mendapatkan Gemini API Key:**
1. Kunjungi https://makersuite.google.com/app/apikey
2. Login dengan Google account
3. Create new API key
4. Copy dan paste ke `.env` file

### 4. Configure Database

Edit `config/config.json` sesuai dengan database Anda:

```json
{
  "development": {
    "username": "your_db_username",
    "password": "your_db_password",
    "database": "your_db_name",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

### 5. Run Migrations

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

Ini akan membuat tables:
- Users
- Products
- Messages
- Carts

### 6. (Optional) Run Seeders

Jika Anda memiliki seeders untuk data awal:

```bash
npx sequelize-cli db:seed:all
```

### 7. Start Server

```bash
npm start
```

Atau dengan nodemon untuk development:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### Messages

- `GET /messages` - Get all messages
- `GET /messages/quick-help` - Get quick help topics
- `POST /messages` - Create new message
- `POST /messages/ai` - Request AI response
- `DELETE /messages/:id` - Delete message

### Cart

- `GET /cart` - Get cart items
- `POST /cart` - Add item to cart
- `DELETE /cart/:id` - Remove item from cart

## Socket.IO Events

### Client → Server

- `join_room` - Join specific chat room
- `send_message` - Send message
- `request_ai` - Request AI support response
- `typing` - User typing indicator

### Server → Client

- `receive_message` - Receive new message
- `ai_typing` - AI typing indicator
- `user_typing` - User typing indicator
- `error` - Error notification

Untuk dokumentasi lengkap, lihat [AI_SUPPORT_GUIDE.md](./AI_SUPPORT_GUIDE.md)

## Project Structure

```
server/
├── app.js                      # Main application file
├── config/
│   ├── config.json            # Database configuration
│   └── aiKnowledgeBase.js     # AI knowledge base
├── controllers/
│   ├── CartController.js      # Cart logic
│   └── MessageController.js   # Message & AI logic
├── migrations/                # Database migrations
├── models/                    # Sequelize models
│   ├── user.js
│   ├── product.js
│   ├── message.js
│   └── cart.js
├── router/                    # Route definitions
│   ├── cart.js
│   └── message.js
└── package.json
```

## AI Support Knowledge Base

AI Support Assistant dilatih dengan informasi tentang:

- **Account Management:** Registration, login, password reset
- **Product Browsing:** Search, filter, product details
- **Shopping Cart:** Add/remove items, checkout process
- **Technical Support:** Website issues, navigation help

Knowledge base dapat di-customize di `config/aiKnowledgeBase.js`

## Testing AI Support

Test dengan pertanyaan seperti:

```
"How do I register?"
"I can't login, what should I do?"
"How do I add items to my cart?"
"What if a product is out of stock?"
"The website is not loading properly"
```

## Development

### Adding New Features to AI Knowledge Base

1. Edit `config/aiKnowledgeBase.js`
2. Tambahkan informasi ke `APP_KNOWLEDGE_BASE` object
3. Update `AI_SYSTEM_PROMPT` jika perlu
4. Restart server

### Testing Socket.IO

Gunakan tools seperti:
- [Socket.IO Client Tool](https://amritb.github.io/socketio-client-tool/)
- Postman (supports WebSocket)
- Custom React/Vue frontend

## Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database connection error
- Check `config/config.json` credentials
- Ensure database server is running
- Verify database exists

### AI not responding
- Check `GEMINI_API_KEY` in `.env`
- Verify API key is valid
- Check internet connection
- Review server logs

### Socket.IO connection failed
- Check CORS configuration in `app.js`
- Verify frontend URL in CORS settings
- Check firewall settings

## Dependencies

Main dependencies:
```json
{
  "express": "^4.18.x",
  "socket.io": "^4.6.x",
  "@google/generative-ai": "^0.1.x",
  "sequelize": "^6.35.x",
  "bcrypt": "^5.1.x",
  "cors": "^2.8.x",
  "pg": "^8.11.x"
}
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request
