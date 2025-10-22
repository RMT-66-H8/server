const express = require('express')
const ProductController = require('../controllers/ProductController')
const authentication = require('../middlewares/authentication')

const productRouter = express.Router()

// Public endpoint - tidak perlu authentication
productRouter.get('/products', ProductController.showAll)

// Protected endpoint - perlu authentication untuk create product
productRouter.post('/products', authentication, ProductController.createProduct)

module.exports = productRouter