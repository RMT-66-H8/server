const express = require('express')
const CartController = require('../controllers/CartController')

const cartRouter = express.Router()

cartRouter.post('/cart', CartController.addCart)
cartRouter.get('/cart', CartController.showCart)
cartRouter.delete('/cart/:id', CartController.removeCart)

module.exports = cartRouter