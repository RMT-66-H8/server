const request = require('supertest');

// Set environment untuk testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const { app, httpServer } = require('../app');
const { Message, User, sequelize } = require('../models');

let authToken;
let userId;

describe('Message Endpoints', () => {
    beforeAll(async () => {
        // Bersihkan data sebelum test - hanya hapus messages dan test user
        await Message.destroy({ where: {} });
        await User.destroy({ where: { email: 'test@example.com' } });
        
        // Register dan login
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        userId = registerResponse.body.id;

        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
        httpServer.close();
    });

    describe('GET /messages', () => {
        test('Should get all messages with authentication', async () => {
            const response = await request(app)
                .get('/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('messages');
            expect(Array.isArray(response.body.messages)).toBe(true);
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .get('/messages')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /messages', () => {
        test('Should create message with authentication', async () => {
            const response = await request(app)
                .post('/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Test message content'
                })
                .expect(201);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('content', 'Test message content');
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .post('/messages')
                .send({
                    content: 'Test message'
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when content is missing', async () => {
            const response = await request(app)
                .post('/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('GET /messages/quick-help', () => {
        test('Should get quick help with authentication', async () => {
            const response = await request(app)
                .get('/messages/quick-help')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('quickHelp');
            expect(Array.isArray(response.body.quickHelp)).toBe(true);
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .get('/messages/quick-help')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /messages/ai', () => {
        test('Should get AI response with authentication', async () => {
            // Skip jika tidak ada GEMINI_API_KEY
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
                console.log('Skipping AI test - no valid GEMINI_API_KEY');
                return;
            }

            const response = await request(app)
                .post('/messages/ai')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'How do I register?'
                })
                .expect(201);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.User).toHaveProperty('isAI', true);
        }, 15000); // Timeout 15s untuk AI response

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .post('/messages/ai')
                .send({
                    content: 'Test AI request'
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when content is missing', async () => {
            const response = await request(app)
                .post('/messages/ai')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('DELETE /messages/:id', () => {
        test('Should delete message with authentication', async () => {
            // Create a message first
            const createResponse = await request(app)
                .post('/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Message to be deleted'
                });

            const messageId = createResponse.body.data.id;

            const response = await request(app)
                .delete(`/messages/${messageId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail without authentication', async () => {
            // Create a message first
            const createResponse = await request(app)
                .post('/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Another message'
                });

            const messageId = createResponse.body.data.id;

            const response = await request(app)
                .delete(`/messages/${messageId}`)
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when message does not exist', async () => {
            // Generate random UUID yang tidak ada
            const fakeUuid = '00000000-0000-0000-0000-000000000000';
            
            const response = await request(app)
                .delete(`/messages/${fakeUuid}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });
    });

    afterAll(async () => {
        // Close server
        if (httpServer) {
            await new Promise((resolve) => {
                httpServer.close(resolve);
            });
        }
    });
});
