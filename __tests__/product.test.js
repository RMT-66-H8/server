const request = require('supertest');

// Set environment untuk testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const { app, httpServer } = require('../app');
const { Product, User, sequelize } = require('../models');

let authToken;

describe('Product Endpoints', () => {
    beforeAll(async () => {
        // Bersihkan data sebelum test
        await Product.destroy({ where: {}, truncate: true, cascade: true });
        await User.destroy({ where: {}, truncate: true, cascade: true });
        
        // Register dan login untuk dapat token
        await request(app)
            .post('/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

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

    describe('GET /products', () => {
        beforeAll(async () => {
            // Seed some products
            await Product.bulkCreate([
                {
                    name: 'Product 1',
                    description: 'Description 1',
                    price: 10000,
                    stock: 50,
                    imageUrl: 'https://example.com/product1.jpg',
                    category: 'Category 1'
                },
                {
                    name: 'Product 2',
                    description: 'Description 2',
                    price: 20000,
                    stock: 30,
                    imageUrl: 'https://example.com/product2.jpg',
                    category: 'Category 2'
                }
            ]);
        });

        test('Should get all products without authentication', async () => {
            const response = await request(app)
                .get('/products')
                .expect(200);

            expect(response.body).toHaveProperty('products');
            expect(Array.isArray(response.body.products)).toBe(true);
            expect(response.body.products.length).toBeGreaterThanOrEqual(2);
        });

        test('Should return products with correct structure', async () => {
            const response = await request(app)
                .get('/products')
                .expect(200);

            const product = response.body.products[0];
            expect(product).toHaveProperty('id');
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('stock');
        });
    });

    describe('POST /products', () => {
        test('Should create product with authentication', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'New Product',
                    description: 'New Description',
                    price: 50000,
                    stock: 100,
                    imageUrl: 'https://example.com/new-product.jpg',
                    category: 'Electronics'
                })
                .expect(201);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('name', 'New Product');
            expect(response.body.data).toHaveProperty('price', 50000);
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .post('/products')
                .send({
                    name: 'Product Without Auth',
                    price: 10000
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when name is missing', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    price: 10000,
                    stock: 50
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when price is missing', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Product Without Price',
                    stock: 50
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when price is negative', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Negative Price Product',
                    price: -1000,
                    stock: 50
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when stock is negative', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Negative Stock Product',
                    price: 10000,
                    stock: -10
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when imageUrl is invalid', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Invalid Image URL Product',
                    price: 10000,
                    imageUrl: 'not-a-url'
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });
});
