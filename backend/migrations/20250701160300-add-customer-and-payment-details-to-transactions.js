'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'customer_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Transactions', 'amount_paid', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'customer_name');
    await queryInterface.removeColumn('Transactions', 'amount_paid');
  }
};