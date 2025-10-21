const express = require('express')

const cartRouter = express.Router()

cartRouter.post('/cart')

module.exports = cartRouter