'use strict';
const bcrypt = require('bcryptjs');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Message, { foreignKey: 'senderId' });
      User.hasMany(models.Cart, { foreignKey: 'userId' });
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: `Name is required` },
        notNull: { msg: `Name is required` }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: `Email is already registered` },
      validate: {
        notEmpty: { msg: `Email is required` },
        notNull: { msg: `Email is required` },
        isEmail: { msg: `Invalid email format` }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: `Password is required` },
        notNull: { msg: `Password is required` }
      }
    },
    isAI: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  });
  return User;
};