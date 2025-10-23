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

        test('Should decrease product stock when added to cart', async () => {
            // Create new product with stock 10
            const testProduct = await Product.create({
                name: 'Stock Test Product',
                description: 'Test stock decrease',
                price: 25000,
                stock: 10,
                imageUrl: 'https://example.com/stock-test.jpg',
                category: 'Test'
            });

            const initialStock = testProduct.stock;

            // Add to cart
            await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct.id
                })
                .expect(201);

            // Check if stock decreased
            const updatedProduct = await Product.findByPk(testProduct.id);
            expect(updatedProduct.stock).toBe(initialStock - 1);
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
        let testProductForRemove;

        beforeAll(async () => {
            // Create new product for remove test
            testProductForRemove = await Product.create({
                name: 'Remove Test Product',
                description: 'Test stock increase on remove',
                price: 30000,
                stock: 5,
                imageUrl: 'https://example.com/remove-test.jpg',
                category: 'Test'
            });

            // Add to cart first
            const addResponse = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProductForRemove.id
                });

            // Get cart item id
            const response = await request(app)
                .get('/cart')
                .set('Authorization', `Bearer ${authToken}`);

            const cartItem = response.body.carts.find(c => c.productId === testProductForRemove.id);
            cartId = cartItem.id;
        });

        test('Should increase product stock when removed from cart', async () => {
            // Get stock before remove
            const productBefore = await Product.findByPk(testProductForRemove.id);
            const stockBefore = productBefore.stock;

            // Remove from cart
            await request(app)
                .delete(`/cart/${cartId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Check if stock increased
            const productAfter = await Product.findByPk(testProductForRemove.id);
            expect(productAfter.stock).toBe(stockBefore + 1);
        });

        test('Should remove item from cart with authentication', async () => {
            // Create another cart item for this test
            const anotherProduct = await Product.create({
                name: 'Another Test Product',
                price: 15000,
                stock: 3
            });

            const addResponse = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: anotherProduct.id
                });

            const cartResponse = await request(app)
                .get('/cart')
                .set('Authorization', `Bearer ${authToken}`);

            const newCartItem = cartResponse.body.carts.find(c => c.productId === anotherProduct.id);

            const response = await request(app)
                .delete(`/cart/${newCartItem.id}`)
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
