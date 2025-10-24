'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'receiverId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'receiverId');
  }
};
