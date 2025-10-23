# E-Commerce Platform with AI Support - Server

Backend server untuk E-Commerce Platform dengan fitur AI Support Assistant, 1-on-1 Private Chat, dan Shopping Cart dengan Checkout menggunakan Socket.IO dan Google Gemini AI.

## ✨ Features

- 🔐 **User Authentication** - Registration & Login dengan JWT
- 🛍️ **Product Management** - Browse produk dengan stock management
- 🛒 **Shopping Cart** - Add/Remove items dengan auto stock control
- 💳 **Checkout System** - Payment processing dan auto clear cart
- 💬 **1-on-1 Private Chat** - Real-time private messaging (Socket.IO)
- 🤖 **AI Support Assistant** - Google Gemini AI dengan knowledge base
- 👥 **Online Users Tracking** - Real-time user presence
- ⌨️ **Typing Indicators** - Live typing status
- 📊 **Test Coverage** - Unit tests dengan Jest

## 🚀 Tech Stack

- **Runtime:** Node.js v22+
- **Framework:** Express.js v5
- **Database:** PostgreSQL (via Sequelize ORM v6)
- **Real-time:** Socket.IO v4.8
- **AI:** Google Gemini 2.5 Flash
- **Authentication:** JWT + bcrypt
- **Testing:** Jest + Supertest

## 📋 Prerequisites

- Node.js v22+ (recommended)
- npm atau yarn
- PostgreSQL database
- Google Gemini API Key

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/RMT-66-H8/server.git
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file di root directory:

```env
# JWT Secret (generate random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini AI API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Database URL (optional, jika tidak pakai config.json)
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# Server Port
PORT=3000

# Node Environment
NODE_ENV=development
```

**Cara mendapatkan Gemini API Key:**
1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan Google account
3. Click "Create API Key"
4. Copy dan paste ke `.env` file

### 4. Configure Database

Edit `config/config.json` sesuai dengan database Anda:

```json
{
  "development": {
    "username": "postgres",
    "password": "your_password",
    "database": "ecommerce_db",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres",
    "password": "your_password",
    "database": "ecommerce_test_db",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

### 5. Setup Database

```bash
# Create database
npx sequelize-cli db:create

# Run migrations
npx sequelize-cli db:migrate

# (Optional) Seed initial data
npx sequelize-cli db:seed:all
```

**Database Tables Created:**
- `Users` - User accounts (with authentication)
- `Products` - Product catalog dengan stock
- `Messages` - Chat messages (1-on-1 dengan receiverId)
- `Carts` - Shopping cart items

### 6. Start Server

**Production:**
```bash
npm start
```

**Development (with auto-reload):**
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📡 API Endpoints

### Authentication (Public)
```
POST   /auth/register     - Register new user
POST   /auth/login        - Login user (returns JWT token)
```

### Products
```
GET    /products          - Get all products (public)
POST   /products          - Create product (protected)
```

### Cart (Protected - Requires JWT)
```
GET    /cart              - Get user's cart items
POST   /cart              - Add product to cart (stock -1)
POST   /cart/checkout     - Checkout & clear cart
DELETE /cart/:id          - Remove item from cart (stock +1)
```

### Messages (Protected - Requires JWT)
```
GET    /messages                - Get all messages
POST   /messages                - Create new message
GET    /messages/quick-help     - Get help topics
POST   /messages/ai             - Request AI response
DELETE /messages/:id            - Delete message
```

## 🔌 Socket.IO Events (1-on-1 Private Chat)

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `user:join` | `{ userId, name, email }` | Join with authentication |
| `chat:join` | `{ userId1, userId2 }` | Join private chat room |
| `message:send` | `{ senderId, receiverId, content }` | Send private message |
| `ai:request` | `{ content, userId }` | Request AI assistance |
| `typing:start` | `{ receiverId }` | Start typing indicator |
| `typing:stop` | `{ receiverId }` | Stop typing indicator |
| `users:get` | - | Get online users list |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `user:connected` | `{ userId, name, email }` | Connection confirmed |
| `users:online` | `[{ userId, name, email }]` | Online users list |
| `message:sent` | `{ message, roomId }` | Message sent confirmation |
| `message:received` | `{ message, roomId }` | New message received |
| `ai:typing` | `{ isTyping }` | AI processing status |
| `ai:response` | `{ message }` | AI response |
| `typing:status` | `{ userId, isTyping }` | User typing status |
| `user:disconnected` | `{ userId, name }` | User went offline |
| `error` | `{ message }` | Error notification |

**Private Room Format:** `private_{smallerUserId}_{largerUserId}`  
Example: User 1 & User 2 → `private_1_2`

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

### Test Socket.IO Private Chat
```bash
npm run test-private-chat
```

### Test AI Support
```bash
npm run test-ai
```

## 📁 Project Structure

```
server/
├── app.js                          # Main app with Socket.IO
├── package.json
├── .env                            # Environment variables
├── .gitignore
├── API_DOCUMENTATION.md            # Complete API docs
├── README.md
│
├── config/
│   ├── config.json                 # Database config
│   └── aiKnowledgeBase.js          # AI training data
│
├── controllers/
│   ├── AuthController.js           # Register & Login
│   ├── CartController.js           # Cart + Checkout
│   ├── MessageController.js        # Chat + AI Assistant
│   └── ProductController.js        # Product CRUD
│
├── middlewares/
│   ├── authentication.js           # JWT verification
│   └── errorHandler.js             # Global error handler
│
├── models/
│   ├── index.js                    # Sequelize init
│   ├── user.js                     # User model
│   ├── product.js                  # Product model (with stock)
│   ├── message.js                  # Message model (with receiverId)
│   └── cart.js                     # Cart model
│
├── migrations/
│   ├── *-create-user.js
│   ├── *-create-product.js
│   ├── *-create-message.js
│   ├── *-create-cart.js
│   └── *-add-receiverId-to-messages.js
│
├── seeders/
│   └── *-seed-product.js           # Initial product data
│
├── router/
│   ├── auth.js                     # Auth routes
│   ├── cart.js                     # Cart routes
│   ├── message.js                  # Message routes
│   └── product.js                  # Product routes
│
├── __tests__/
│   ├── auth.test.js
│   ├── cart.test.js
│   ├── message.test.js
│   ├── product.test.js
│   └── errorHandler.test.js
│
└── coverage/                       # Test coverage reports
```

## 🤖 AI Support Features

### AI Knowledge Base
AI Support Assistant trained dengan:
- **Authentication:** Registration, login, password issues
- **Products:** Browse, search, stock management  
- **Shopping:** Cart operations, checkout process
- **Technical:** Website issues, navigation help
- **FAQs:** Common questions & solutions

### Customizing AI Knowledge
Edit `config/aiKnowledgeBase.js`:
```javascript
module.exports = {
  appName: "Your App Name",
  authentication: { /* ... */ },
  products: { /* ... */ },
  cart: { /* ... */ },
  faq: { /* ... */ }
}
```

### Example AI Questions
```
✅ "How do I create an account?"
✅ "I forgot my password"
✅ "How to add items to cart?"
✅ "Can I remove items from cart?"
✅ "What if product is out of stock?"
✅ "How do I checkout?"
```

## 🛠️ Available Scripts

```bash
npm start                    # Start production server
npm run dev                  # Start with nodemon (auto-reload)
npm test                     # Run all tests with coverage
npm run test-private-chat    # Test Socket.IO private chat
npm run test-ai              # Test AI assistant
npm run migrate              # Run database migrations
npm run migrate:undo         # Undo last migration
```

## 🔐 Authentication Flow

1. **Register:** `POST /auth/register`
   - Creates user with hashed password
   - Returns JWT token

2. **Login:** `POST /auth/login`
   - Validates credentials
   - Returns JWT token

3. **Protected Routes:**
   - Add `Authorization: Bearer <token>` header
   - Token verified by `authentication` middleware

## 🛒 Shopping Flow

1. **Browse Products:** `GET /products` (public)
2. **Add to Cart:** `POST /cart` (stock -1)
3. **View Cart:** `GET /cart`
4. **Checkout:** `POST /cart/checkout`
   - ✅ Validates cart not empty
   - ✅ Validates stock available
   - ✅ Calculates total amount
   - ✅ Clears cart automatically
   - ✅ Stock remains decreased (purchased)

## 💬 Chat Flow (1-on-1 Private)

1. **Connect:** `socket.io('http://localhost:3000')`
2. **Authenticate:** `socket.emit('user:join', { userId, name, email })`
3. **Join Chat:** `socket.emit('chat:join', { userId1, userId2 })`
4. **Send Message:** `socket.emit('message:send', { senderId, receiverId, content })`
5. **Receive:** `socket.on('message:received', (data) => {})`

**Key Points:**
- ✅ Only 1-on-1 private messaging
- ✅ No group chat / broadcast
- ✅ Messages saved with `receiverId`
- ✅ Real-time delivery if user online
- ✅ Typing indicators supported

## 🐛 Troubleshooting

### Port already in use
**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
```bash
# Check PostgreSQL is running
# Windows: services.msc → PostgreSQL
# Linux: sudo systemctl status postgresql
# Mac: brew services list

# Verify config/config.json credentials
# Test connection: psql -U username -d database_name
```

### Socket.IO connection failed
- ✅ Check CORS settings in `app.js`
- ✅ Verify client uses correct URL
- ✅ Check firewall/network settings
- ✅ Use `transports: ['websocket']` if polling fails

### JWT token invalid
- ✅ Check `JWT_SECRET` in `.env`
- ✅ Verify token format: `Bearer <token>`
- ✅ Token expires after configured time
- ✅ Generate new token via login

### Migration errors
```bash
# Reset database (WARNING: deletes all data)
npx sequelize-cli db:drop
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## 📚 Documentation

- **API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Test Coverage:** Open `coverage/lcov-report/index.html` in browser

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Create Pull Request to `dev` branch

## 📝 License

ISC

## 👥 Team

**RMT-66-H8** - Hacktiv8 Batch 66

## 🔗 Links

- **Repository:** [github.com/RMT-66-H8/server](https://github.com/RMT-66-H8/server)
- **Issues:** [github.com/RMT-66-H8/server/issues](https://github.com/RMT-66-H8/server/issues)

---

**Last Updated:** October 23, 2025  
**Version:** 1.0.0  
**Node.js:** v22.17.0  
**Socket.IO:** v4.8.1  
**Sequelize:** v6.37.7  

Made with ❤️ by RMT-66-H8
```
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
