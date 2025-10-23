const { Cart, Product, User } = require('../models')

class CartController {
    // Menambahkan produk ke keranjang belanja
    static async addCart(req, res, next) {
        try {
            const { productId } = req.body
            const userId = req.user.id

            // Cek apakah produk ada di database
            const product = await Product.findByPk(productId)

            if (!product) {
                throw { name: "NotFound", message: "Product not found" }
            }

            // Cek apakah stok produk masih tersedia
            if (product.stock <= 0) {
                throw { name: "BadRequest", message: "Product is out of stock" }
            }

            // Cek apakah produk sudah ada di keranjang user
            const existingCart = await Cart.findOne({
                where: {
                    userId,
                    productId
                }
            })

            if (existingCart) {
                throw { name: "BadRequest", message: "Product already in your cart" }
            }

            // Buat item keranjang baru
            const cart = await Cart.create({
                userId,
                productId
            })

            // Kurangi stock product sebanyak 1
            await product.decrement('stock', { by: 1 })

            // Ambil data lengkap keranjang dengan detail produk (dengan stock yang sudah dikurangi)
            const completeCart = await Cart.findByPk(cart.id, {
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'name', 'description', 'price', 'stock', 'imageUrl', 'category']
                    }
                ]
            })

            res.status(201).json({ 
                message: 'Product added to cart successfully', 
                data: completeCart 
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    // Menampilkan semua item di keranjang belanja user
    static async showCart(req, res, next) {
        try {
            const userId = req.user.id

            // Ambil semua item keranjang milik user dengan detail produk
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
            console.log(error)
            next(error)
        }
    }

    // Menghapus item dari keranjang belanja
    static async removeCart(req, res, next) {
        try {
            const { id } = req.params
            const userId = req.user.id

            // Cari item keranjang berdasarkan id dan userId
            const cart = await Cart.findOne({
                where: {
                    id, 
                    userId
                }
            })

            if (!cart) {
                throw { name: "NotFound", message: "Cart item not found" }
            }

            // Ambil productId sebelum hapus (untuk kembalikan stock)
            const productId = cart.productId

            // Hapus item dari keranjang
            await cart.destroy()

            // Kembalikan stock product sebanyak 1
            await Product.increment('stock', { 
                by: 1, 
                where: { id: productId } 
            })

            res.status(200).json({ message: 'Product removed from cart successfully' })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}

module.exports = CartController