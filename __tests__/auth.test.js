const request = require('supertest');

// Set environment untuk testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const { app, httpServer } = require('../app');
const { User, sequelize } = require('../models');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        // Setup: Bersihkan data sebelum test (tidak drop table)
        await User.destroy({ where: {}, truncate: true, cascade: true });
    });

    afterAll(async () => {
        // Cleanup: Tutup koneksi setelah test
        await sequelize.close();
        httpServer.close();
    });

    describe('POST /auth/register', () => {
        test('Should register a new user successfully', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', 'Test User');
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).not.toHaveProperty('password');
        });

        test('Should fail when name is missing', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test2@example.com',
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when email is missing', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User 2',
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when password is missing', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User 3',
                    email: 'test3@example.com'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when email is already registered', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User Duplicate',
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when email format is invalid', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User Invalid',
                    email: 'invalid-email',
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /auth/login', () => {
        test('Should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('email', 'test@example.com');
        });

        test('Should fail when email is missing', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when password is missing', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail with incorrect email', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123'
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });
});
