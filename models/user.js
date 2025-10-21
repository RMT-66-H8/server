'use strict';
const bcrypt = require('bcrypt')
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
      User.hasMany(models.Message, { foreignKey: 'senderId', onDelete: 'CASCADE' })
      User.hasMany(models.Cart, { foreignKey: 'userId' })
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAI: {
      type: DataTypes.BOOLEAN,
      defaultValue: false 
    }

  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user) => {
        user.password = bcrypt.hashSync(user.password, 10)
      }
    }
  });
  return User;
};