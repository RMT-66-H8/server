const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw { name: "Unauthorized" };
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw { name: "Unauthorized" };
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(payload.id);
    if (!user) {
      throw { name: "Unauthorized" };
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authentication;