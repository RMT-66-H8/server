# API Documentation - E-Commerce Server

## Base URL
```
http://localhost:3000
```

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Product Endpoints](#product-endpoints)
3. [Cart Endpoints](#cart-endpoints)
4. [Message Endpoints](#message-endpoints)
5. [Error Responses](#error-responses)
6. [Authentication Flow](#authentication-flow)

---

## Authentication Endpoints

### 1. Register New User
Creates a new user account and returns authentication token.

**Endpoint:** `POST /register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
```json
{
  "message": "Name, email, and password are required"
}
```
- `400 Bad Request` - Email already registered
```json
{
  "message": "Email already registered"
}
```

---

### 2. Login
Authenticates user and returns JWT token.

**Endpoint:** `POST /login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400 Bad Request` - Missing credentials
```json
{
  "message": "Email and password are required"
}
```
- `401 Unauthorized` - Invalid credentials
```json
{
  "message": "Invalid email or password"
}
```

---

## Product Endpoints

### 3. Get All Products
Retrieves all available products (Public endpoint - no authentication required).

**Endpoint:** `GET /products`

**Request Headers:**
```
(No authentication required)
```

**Success Response (200 OK):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Laptop Gaming",
      "description": "High-performance gaming laptop with RTX 3080",
      "price": 25000000,
      "stock": 15,
      "imageUrl": "https://example.com/laptop.jpg",
      "category": "Electronics",
      "createdAt": "2025-10-22T10:30:00.000Z",
      "updatedAt": "2025-10-22T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse with RGB lighting",
      "price": 350000,
      "stock": 50,
      "imageUrl": "https://example.com/mouse.jpg",
      "category": "Accessories",
      "createdAt": "2025-10-22T10:35:00.000Z",
      "updatedAt": "2025-10-22T10:35:00.000Z"
    }
  ]
}
```

---

### 4. Create Product
Creates a new product (Requires authentication).

**Endpoint:** `POST /products`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with Cherry MX switches",
  "price": 1200000,
  "stock": 30,
  "imageUrl": "https://example.com/keyboard.jpg",
  "category": "Accessories"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Product created successfully",
  "data": {
    "id": 3,
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical keyboard with Cherry MX switches",
    "price": 1200000,
    "stock": 30,
    "imageUrl": "https://example.com/keyboard.jpg",
    "category": "Accessories",
    "createdAt": "2025-10-23T08:15:00.000Z",
    "updatedAt": "2025-10-23T08:15:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
```json
{
  "message": "Unauthorized access"
}
```
- `400 Bad Request` - Validation error
```json
{
  "message": ["Price must be a positive number", "Stock is required"]
}
```

---

## Cart Endpoints

All cart endpoints require authentication.

### 5. Add Product to Cart
Adds a product to the user's shopping cart.

**Endpoint:** `POST /cart`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": 1
}
```

**Success Response (201 Created):**
```json
{
  "message": "Product added to cart successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "createdAt": "2025-10-23T09:00:00.000Z",
    "updatedAt": "2025-10-23T09:00:00.000Z",
    "Product": {
      "id": 1,
      "name": "Laptop Gaming",
      "description": "High-performance gaming laptop with RTX 3080",
      "price": 25000000,
      "stock": 15,
      "imageUrl": "https://example.com/laptop.jpg",
      "category": "Electronics"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
```json
{
  "message": "Unauthorized access"
}
```
- `404 Not Found` - Product doesn't exist
```json
{
  "message": "Product not found"
}
```
- `400 Bad Request` - Product out of stock
```json
{
  "message": "Product is out of stock"
}
```
- `400 Bad Request` - Product already in cart
```json
{
  "message": "Product already in your cart"
}
```

---

### 6. Get User's Cart
Retrieves all items in the authenticated user's shopping cart.

**Endpoint:** `GET /cart`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "carts": [
    {
      "id": 1,
      "userId": 1,
      "productId": 1,
      "createdAt": "2025-10-23T09:00:00.000Z",
      "updatedAt": "2025-10-23T09:00:00.000Z",
      "Product": {
        "id": 1,
        "name": "Laptop Gaming",
        "description": "High-performance gaming laptop with RTX 3080",
        "price": 25000000,
        "stock": 15,
        "imageUrl": "https://example.com/laptop.jpg",
        "category": "Electronics"
      }
    },
    {
      "id": 2,
      "userId": 1,
      "productId": 2,
      "createdAt": "2025-10-23T09:05:00.000Z",
      "updatedAt": "2025-10-23T09:05:00.000Z",
      "Product": {
        "id": 2,
        "name": "Wireless Mouse",
        "description": "Ergonomic wireless mouse with RGB lighting",
        "price": 350000,
        "stock": 50,
        "imageUrl": "https://example.com/mouse.jpg",
        "category": "Accessories"
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
```json
{
  "message": "Unauthorized access"
}
```

---

### 7. Remove Product from Cart
Removes a specific item from the user's shopping cart.

**Endpoint:** `DELETE /cart/:id`

**URL Parameters:**
- `id` (integer) - Cart item ID

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Product removed from cart successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
```json
{
  "message": "Unauthorized access"
}
```
- `404 Not Found` - Cart item not found or doesn't belong to user
```json
{
  "message": "Cart item not found"
}
```

---

## Message Endpoints

All message endpoints require authentication.

### 8. Get All Messages
Retrieves all messages from the conversation history.

**Endpoint:** `GET /messages`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "senderId": 1,
      "content": "Hello, I need help with registration",
      "createdAt": "2025-10-23T10:00:00.000Z",
      "updatedAt": "2025-10-23T10:00:00.000Z",
      "User": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "isAI": false
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "senderId": 2,
      "content": "Hello! I'm here to help. To create an account, please follow these steps: 1. Click on the Register button...",
      "createdAt": "2025-10-23T10:00:05.000Z",
      "updatedAt": "2025-10-23T10:00:05.000Z",
      "User": {
        "id": 2,
        "name": "Support Assistant",
        "email": "support@ai-assistant.com",
        "isAI": true
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
```json
{
  "message": "Unauthorized access"
}
```

---

### 9. Create Message
Sends a new message from the authenticated user.

**Endpoint:** `POST /messages`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "How do I add items to my cart?"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Message created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "senderId": 1,
    "content": "How do I add items to my cart?",
    "createdAt": "2025-10-23T10:15:00.000Z",
    "updatedAt": "2025-10-23T10:15:00.000Z",
    "User": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "isAI": false
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not logged in
```json
{
  "message": "Please login to send messages"
}
```
- `400 Bad Request` - Missing content
```json
{
  "message": "Message content is required"
}
```

---

### 10. Request AI Response
Generates an AI-powered response to a user's question using Google Gemini API.

**Endpoint:** `POST /messages/ai`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "What are the steps to register an account?",
  "userId": 1
}
```

**Success Response (201 Created):**
```json
{
  "message": "AI response generated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "senderId": 2,
    "content": "To register an account, please follow these steps:\n\n1. Navigate to the registration page\n2. Fill in your full name\n3. Enter a valid email address\n4. Create a strong password\n5. Click the Register button\n\nAfter successful registration, you will receive an authentication token that you can use to access protected features. If you encounter any issues during registration, please let me know and I'll be happy to help!",
    "createdAt": "2025-10-23T10:15:05.000Z",
    "updatedAt": "2025-10-23T10:15:05.000Z",
    "User": {
      "id": 2,
      "name": "Support Assistant",
      "email": "support@ai-assistant.com",
      "isAI": true
    }
  }
}
```

**AI Features:**
- Uses Google Gemini 2.5 Flash model
- Context-aware responses based on conversation history
- Knowledge base integration for accurate product/feature information
- Step-by-step guidance for common tasks
- Friendly and supportive tone

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
```json
{
  "message": "Unauthorized access"
}
```
- `400 Bad Request` - Missing content
```json
{
  "message": "Message content is required"
}
```

---

### 11. Get Quick Help Topics
Retrieves categorized list of common help topics for quick assistance.

**Endpoint:** `GET /messages/quick-help`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "quickHelp": [
    {
      "id": 1,
      "category": "Getting Started",
      "topics": [
        "How do I create an account?",
        "How do I login to my account?",
        "I forgot my password, what should I do?"
      ]
    },
    {
      "id": 2,
      "category": "Shopping",
      "topics": [
        "How do I browse products?",
        "How do I add items to cart?",
        "How do I remove items from cart?",
        "What if a product is out of stock?"
      ]
    },
    {
      "id": 3,
      "category": "Account Issues",
      "topics": [
        "Why can't I login?",
        "Can I change my email address?",
        "Is my information secure?"
      ]
    },
    {
      "id": 4,
      "category": "Technical Support",
      "topics": [
        "Website is not loading properly",
        "How do I contact support?",
        "Can I use the app on mobile?"
      ]
    }
  ],
  "appInfo": {
    "name": "E-Commerce Platform",
    "type": "E-Commerce Application",
    "supportAvailable": "24/7 AI Support and Support Team"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
```json
{
  "message": "Unauthorized access"
}
```

---

### 12. Delete Message
Deletes a message. Only the sender can delete their own messages.

**Endpoint:** `DELETE /messages/:id`

**URL Parameters:**
- `id` (UUID string) - Message ID

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Message deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Not logged in
```json
{
  "message": "Please login"
}
```
- `404 Not Found` - Message doesn't exist
```json
{
  "message": "Message not found"
}
```
- `403 Forbidden` - User doesn't own the message
```json
{
  "message": "You are not allowed to delete this message"
}
```

---

## Error Responses

### Common HTTP Status Codes

| Status Code | Name | Description |
|------------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

All errors follow this structure:

```json
{
  "message": "Error description here"
}
```

For validation errors (Sequelize):
```json
{
  "message": [
    "Email must be unique",
    "Password must be at least 8 characters"
  ]
}
```

### Authentication Errors

**Missing Authorization Header:**
```json
{
  "message": "Unauthorized access"
}
```

**Invalid Token:**
```json
{
  "message": "Invalid token"
}
```

**Expired Token:**
```json
{
  "message": "Invalid token"
}
```

**User Not Found:**
```json
{
  "message": "Unauthorized access"
}
```

---

## Authentication Flow

### How to Authenticate Requests

1. **Register or Login** to get JWT token
2. **Include token** in subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Token Payload** contains:
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

### Protected Endpoints

The following endpoints require authentication:

**Products:**
- `POST /products` - Create product

**Cart:**
- `POST /cart` - Add to cart
- `GET /cart` - View cart
- `DELETE /cart/:id` - Remove from cart

**Messages:**
- `GET /messages` - Get all messages
- `GET /messages/quick-help` - Get quick help
- `POST /messages` - Create message
- `POST /messages/ai` - Request AI response
- `DELETE /messages/:id` - Delete message

### Public Endpoints

These endpoints do NOT require authentication:

- `POST /register` - User registration
- `POST /login` - User login
- `GET /products` - Browse products

---

## Request/Response Examples

### Example 1: Complete User Registration Flow

**1. Register:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "id": 5,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsImlhdCI6MTY5ODEyMzQ1Nn0.abc123"
}
```

**2. Browse Products:**
```bash
curl http://localhost:3000/products
```

**3. Add to Cart (using token):**
```bash
curl -X POST http://localhost:3000/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"productId": 1}'
```

### Example 2: AI Chat Flow

**1. Send Message:**
```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content": "How do I check my cart?"}'
```

**2. Request AI Response:**
```bash
curl -X POST http://localhost:3000/messages/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "content": "How do I check my cart?",
    "userId": 1
  }'
```

**3. Get All Messages:**
```bash
curl http://localhost:3000/messages \
  -H "Authorization: Bearer <token>"
```

---

## Additional Notes

### Environment Variables Required

```env
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
DATABASE_URL=your_database_connection_string
```

### Database Models

**User:**
- id (Integer, Primary Key)
- name (String, Not Null)
- email (String, Unique, Not Null)
- password (String, Hashed, Not Null)
- isAI (Boolean, Default: false)

**Product:**
- id (Integer, Primary Key)
- name (String, Not Null)
- description (Text)
- price (Decimal, Not Null)
- stock (Integer, Not Null)
- imageUrl (String)
- category (String)

**Cart:**
- id (Integer, Primary Key)
- userId (Integer, Foreign Key → User)
- productId (Integer, Foreign Key → Product)

**Message:**
- id (UUID, Primary Key)
- senderId (Integer, Foreign Key → User)
- content (Text, Not Null)

### Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use, especially for:
- Registration/Login endpoints
- AI response generation endpoint

### WebSocket Support

For real-time message updates, consider implementing Socket.IO integration. The current implementation uses REST endpoints.

### Testing

Run tests with:
```bash
npm test
```

Test coverage available in `/coverage` directory.

---

## Support

For issues or questions:
- AI Support: Available 24/7 via `/messages/ai` endpoint
- Technical Support: Contact development team

**Last Updated:** October 23, 2025
**API Version:** 1.0.0
