'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    // Tambah kolom untuk sisa pembayaran
    await queryInterface.addColumn('Transactions', 'remaining_amount', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
    // Ubah tipe data kolom status untuk menampung status 'Lunas' atau 'Belum Lunas'
    await queryInterface.changeColumn('Transactions', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'Lunas'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'remaining_amount');
    await queryInterface.changeColumn('Transactions', 'status', {
      type: Sequelize.STRING 
    });
  }
};