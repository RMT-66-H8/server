const express = require('express')
const ProductController = require('../controllers/ProductController')

const productRouter = express.Router()

productRouter.get('/products', ProductController.showAll)
productRouter.post('/products', ProductController.createProduct)

module.exports = productRouter