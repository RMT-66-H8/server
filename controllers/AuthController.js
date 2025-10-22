const {
    User
} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
    static async register(req, res, next) {
        try {
            const {
                name,
                email,
                password
            } = req.body;

            if (!name || !email || !password) {
                throw {
                    name: "BadRequest",
                    message: "Name, email, and password are required"
                };
            }

            const newUser = await User.create({
                name,
                email,
                password
            });

            res.status(201).json({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            });
        } catch (err) {
            next(err);
        }
    }

    static async login(req, res, next) {
        try {
            const {
                email,
                password
            } = req.body;

            if (!email || !password) {
                throw {
                    name: "BadRequest",
                    message: "Email and password are required"
                };
            }

            const user = await User.findOne({
                where: {
                    email
                }
            });
            if (!user) {
                throw {
                    name: "InvalidLogin"
                };
            }

            const isValid = bcrypt.compareSync(password, user.password);
            if (!isValid) {
                throw {
                    name: "InvalidLogin"
                };
            }

            const payload = {
                id: user.id,
                email: user.email
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET);

            res.status(200).json({
                access_token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AuthController;