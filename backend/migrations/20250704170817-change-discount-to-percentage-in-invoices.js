'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Invoices', 'discount', 'discount_percentage');
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Invoices', 'discount_percentage', 'discount');
  }
};