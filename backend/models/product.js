'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
      Product.hasMany(models.TransactionItem, { foreignKey: 'product_id' });
      Product.hasMany(models.StockEntry, { foreignKey: 'product_id' });
    }
  }
  Product.init({
    sku: DataTypes.STRING,
    name: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    hpp: DataTypes.DECIMAL,
    sell_price: DataTypes.DECIMAL,
    category: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};