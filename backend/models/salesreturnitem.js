'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalesReturnItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definisikan relasi di sini
      SalesReturnItem.belongsTo(models.SalesReturn, { foreignKey: 'sales_return_id' });
      // TAMBAHKAN BARIS INI
      SalesReturnItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  SalesReturnItem.init({
    sales_return_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity_returned: DataTypes.DECIMAL,
    price_at_return: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'SalesReturnItem',
  });
  return SalesReturnItem;
};