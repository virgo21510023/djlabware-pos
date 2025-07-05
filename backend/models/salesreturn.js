'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalesReturn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Satu Retur milik satu Transaksi asli
      SalesReturn.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
      // Satu Retur memiliki banyak Item Retur
      SalesReturn.hasMany(models.SalesReturnItem, { foreignKey: 'sales_return_id', as: 'items' });
    }
  }
  SalesReturn.init({
    return_number: DataTypes.STRING,
    transaction_id: DataTypes.INTEGER,
    return_date: DataTypes.DATE,
    total_refund_amount: DataTypes.DECIMAL,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'SalesReturn',
  });
  return SalesReturn;
};