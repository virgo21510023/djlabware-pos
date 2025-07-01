'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.User, { foreignKey: 'user_id' });
      Transaction.hasMany(models.TransactionItem, { foreignKey: 'transaction_id' });
    }
  }
  Transaction.init({
    invoice_number: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    total_amount: DataTypes.DECIMAL,
    total_hpp: DataTypes.DECIMAL,
    payment_method: DataTypes.STRING,
    status: DataTypes.STRING,
    
    // BARIS PENTING YANG PERLU DITAMBAHKAN ADA DI SINI
    transaction_date: DataTypes.DATE

  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};