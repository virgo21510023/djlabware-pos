'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Quotations', 'discount', 'discount_percentage');
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Quotations', 'discount_percentage', 'discount');
  }
};