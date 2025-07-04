'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DeliveryOrders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      do_number: {
        type: Sequelize.STRING
      },
      invoice_id: {
        type: Sequelize.INTEGER
      },
      delivery_date: {
        type: Sequelize.DATE
      },
      recipient_name: {
        type: Sequelize.STRING
      },
      shipping_address: {
        type: Sequelize.TEXT
      },
      vehicle_number: {
        type: Sequelize.STRING
      },
      driver_name: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('DeliveryOrders');
  }
};