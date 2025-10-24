const express = require('express')
const CartController = require('../controllers/CartController')
const authentication = require('../middlewares/authentication')

const cartRouter = express.Router()

// Semua endpoint cart memerlukan authentication
cartRouter.post('/cart', authentication, CartController.addCart)
cartRouter.get('/cart', authentication, CartController.showCart)
cartRouter.post('/cart/checkout', authentication, CartController.checkout)
cartRouter.delete('/cart/:id', authentication, CartController.removeCart)

module.exports = cartRouter