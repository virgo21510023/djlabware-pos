'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StockEntry extends Model {
    static associate(models) {
      // define association here
      StockEntry.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  StockEntry.init({
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    supplier: DataTypes.STRING,
    notes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StockEntry',
    tableName: 'StockEntries'
  });
  return StockEntry;
};