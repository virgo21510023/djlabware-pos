'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('PurchaseOrders', 'subtotal', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
    await queryInterface.addColumn('PurchaseOrders', 'discount_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0
    });
    await queryInterface.addColumn('PurchaseOrders', 'vat_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0
    });
    await queryInterface.addColumn('PurchaseOrders', 'grand_total', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
  },
  async down (queryInterface, Sequelize) {
    // ... (down function)
  }
};