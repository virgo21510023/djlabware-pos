'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('InvoiceItems', 'stock_status', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('InvoiceItems', 'stock_status');
  }
};