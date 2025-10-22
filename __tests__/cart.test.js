const request = require('supertest');

// Set environment untuk testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const { app, httpServer } = require('../app');
const { Cart, Product, User, sequelize } = require('../models');

let authToken;
let userId;
let productId;

describe('Cart Endpoints', () => {
    beforeAll(async () => {
        // Bersihkan data sebelum test
        await Cart.destroy({ where: {}, truncate: true, cascade: true });
        await Product.destroy({ where: {}, truncate: true, cascade: true });
        await User.destroy({ where: {}, truncate: true, cascade: true });
        
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

        // Create a product for testing
        const product = await Product.create({
            name: 'Test Product',
            description: 'Test Description',
            price: 50000,
            stock: 100,
            imageUrl: 'https://example.com/test.jpg',
            category: 'Test'
        });

        productId = product.id;
    });

    afterAll(async () => {
        await sequelize.close();
        httpServer.close();
    });

    describe('POST /cart', () => {
        test('Should add product to cart with authentication', async () => {
            const response = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: productId
                })
                .expect(201);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('productId', productId);
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .post('/cart')
                .send({
                    productId: productId
                })
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when product does not exist', async () => {
            const response = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: 99999
                })
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when product is already in cart', async () => {
            const response = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: productId
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when product is out of stock', async () => {
            // Create product with no stock
            const outOfStockProduct = await Product.create({
                name: 'Out of Stock Product',
                price: 10000,
                stock: 0
            });

            const response = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: outOfStockProduct.id
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('GET /cart', () => {
        test('Should get user cart with authentication', async () => {
            const response = await request(app)
                .get('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('carts');
            expect(Array.isArray(response.body.carts)).toBe(true);
            expect(response.body.carts.length).toBeGreaterThan(0);
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .get('/cart')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should return cart items with product details', async () => {
            const response = await request(app)
                .get('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const cartItem = response.body.carts[0];
            expect(cartItem).toHaveProperty('Product');
            expect(cartItem.Product).toHaveProperty('name');
            expect(cartItem.Product).toHaveProperty('price');
        });
    });

    describe('DELETE /cart/:id', () => {
        let cartId;

        beforeAll(async () => {
            // Get cart item id
            const response = await request(app)
                .get('/cart')
                .set('Authorization', `Bearer ${authToken}`);

            cartId = response.body.carts[0].id;
        });

        test('Should remove item from cart with authentication', async () => {
            const response = await request(app)
                .delete(`/cart/${cartId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail without authentication', async () => {
            const response = await request(app)
                .delete(`/cart/${cartId}`)
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        test('Should fail when cart item does not exist', async () => {
            const response = await request(app)
                .delete('/cart/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });
    });
});
