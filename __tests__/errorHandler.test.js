const request = require('supertest');

// Set environment untuk testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const { app } = require('../app');
const { User, Product } = require('../models');

describe('Error Handler Middleware', () => {
    let authToken;

    beforeAll(async () => {
        // Clean up and create test user
        await User.destroy({ where: { email: 'errortest@example.com' } });
        
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                name: 'Error Test User',
                email: 'errortest@example.com',
                password: 'password123'
            });

        authToken = registerResponse.body.token;
    });

    afterAll(async () => {
        // Clean up
        await User.destroy({ where: { email: 'errortest@example.com' } });
    });

    describe('Validation Errors', () => {
        test('Should handle missing required fields (BadRequest)', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test@test.com'
                    // missing name and password
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should handle duplicate email (BadRequest)', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'errortest@example.com', // Already exists
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should handle invalid product validation', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Product',
                    price: -100, // Invalid negative price
                    stock: 10,
                    imageUrl: 'http://example.com/image.jpg'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Authentication Errors', () => {
        test('Should handle missing token (Unauthorized)', async () => {
            const response = await request(app)
                .post('/products')
                .send({
                    name: 'Test Product',
                    price: 100,
                    stock: 10,
                    imageUrl: 'http://example.com/image.jpg'
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should handle invalid token (JsonWebTokenError)', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', 'Bearer invalid-token-here')
                .send({
                    name: 'Test Product',
                    price: 100,
                    stock: 10,
                    imageUrl: 'http://example.com/image.jpg'
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Not Found Errors', () => {
        test('Should handle product not found', async () => {
            const response = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: 99999, // Non-existent product
                    quantity: 1
                })
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });

        test('Should handle invalid route (404)', async () => {
            const response = await request(app)
                .get('/invalid-route-that-does-not-exist')
                .expect(404);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('not found');
        });
    });

    describe('Sequelize Errors', () => {
        test('Should handle login with wrong credentials (Unauthorized)', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'errortest@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });
});
