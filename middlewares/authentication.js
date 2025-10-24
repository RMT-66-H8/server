const jwt = require('jsonwebtoken')
const { User } = require('../models')

async function authentication(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader) {
      throw { name: 'Unauthorized', message: 'Missing Authorization header' }
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw { name: 'Unauthorized', message: 'Invalid Authorization header' }
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(payload.id)
    if (!user) {
      throw { name: 'Unauthorized', message: 'User not found' }
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAI: user.isAI
    }

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = authentication