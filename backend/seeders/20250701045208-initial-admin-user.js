// backend/seeders/xxxx-initial-admin-user.js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('Users', [{
      name: 'Admin',
      username: 'admin',
      password: hashedPassword,
      role: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};