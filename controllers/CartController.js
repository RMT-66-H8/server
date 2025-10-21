const { Cart, Product, User } = require('../models')

class CartController {
    static async addCart(req, res, next) {
        try {
            const { productId } = req.body
            const userId = req.user.id

            const product = await Product.findByPk(productId)

            if (!product) {
                return res.status(404).json({ message: 'Product not found' })
            }

            const cart = await Cart.create({
                userId,
                productId
            })

            res.status(201).json({ message: 'Product added to cart successfully', cart })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async showCart(req, res, next) {
        try {
            const userId = req.user.id

            const carts = await Cart.findAll({
                where: { userId },
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'name', 'description', 'price', 'stock', 'imageUrl', 'category']
                    }
                ],
                order: [['createdAt', 'DESC']]
            })

            res.status(200).json({ carts })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async removeCart(req, res, next) {
        try {
            const { id } = req.params
            const userId = req.user.id

            const cart = await Cart.findOne({
                where: {
                    id, 
                    userId
                }
            })

            if (!cart) {
                return res.status(404).json({ message: 'Cart item not found' })
            }

            await cart.destroy()

            res.status(200).json({ message: 'Product removed from cart successfully' })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}

module.exports = CartController