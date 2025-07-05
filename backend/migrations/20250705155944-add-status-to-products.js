'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'listed', // Produk lama otomatis dianggap 'listed'
      allowNull: false
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'status');
  }
};