'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'down_payment', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'down_payment');
  }
};