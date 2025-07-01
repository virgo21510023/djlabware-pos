'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionItem extends Model {
    static associate(models) {
      // define association here
      TransactionItem.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
      TransactionItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  TransactionItem.init({
    transaction_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price_per_item: DataTypes.DECIMAL,
    hpp_per_item: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'TransactionItem',
    // Nama tabel eksplisit jika berbeda dari jamak modelName
    tableName: 'TransactionItems'
  });
  return TransactionItem;
};