'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    // Menambah kolom 'satuan'
    await queryInterface.addColumn('Products', 'satuan', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Menambah kolom 'merk'
    await queryInterface.addColumn('Products', 'merk', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Menambah kolom 'kategori'
    await queryInterface.addColumn('Products', 'kategori', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'satuan');
    await queryInterface.removeColumn('Products', 'merk');
    await queryInterface.removeColumn('Products', 'kategori');
  }
};