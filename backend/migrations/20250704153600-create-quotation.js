'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Quotations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quotation_number: {
        type: Sequelize.STRING
      },
      quotation_date: {
        type: Sequelize.DATE
      },
      customer_name: {
        type: Sequelize.STRING
      },
      valid_until: {
        type: Sequelize.DATE
      },
      subtotal: {
        type: Sequelize.DECIMAL
      },
      discount: {
        type: Sequelize.DECIMAL
      },
      shipping_cost: {
        type: Sequelize.DECIMAL
      },
      vat_amount: {
        type: Sequelize.DECIMAL
      },
      grand_total: {
        type: Sequelize.DECIMAL
      },
      notes: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Quotations');
  }
};