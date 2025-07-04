'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Settings', 'bank_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Settings', 'bank_account', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Settings', 'bank_beneficiary', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Settings', 'bank_name');
    await queryInterface.removeColumn('Settings', 'bank_account');
    await queryInterface.removeColumn('Settings', 'bank_beneficiary');
  }
};