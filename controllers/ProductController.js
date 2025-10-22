const { Product } = require('../models')

class ProductController {
    static async showAll(req, res, next) {
        try {
            const products = await Product.findAll()

            res.status(200).json(products)
        } catch (error) {
            next(error)
        }
    }

    static async createProduct(req, res, next) {
        try {
            const { name, description, price, stock, imageUrl, category } = req.body

            const product = Product.create({ name, description, price, stock, imageUrl, category })

            res.status(201).json({product})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ProductController