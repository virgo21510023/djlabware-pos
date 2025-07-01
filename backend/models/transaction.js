'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
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
    transaction_date: DataTypes.DATE,
    customer_name: DataTypes.STRING,
    amount_paid: DataTypes.DECIMAL,
    remaining_amount: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};