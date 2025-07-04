'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuotationItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Satu Item Penawaran milik satu Penawaran
      QuotationItem.belongsTo(models.Quotation, { foreignKey: 'quotation_id' });
      // Satu Item Penawaran juga bisa merujuk ke satu Produk
      QuotationItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  QuotationItem.init({
    quotation_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    quantity: DataTypes.DECIMAL,
    price: DataTypes.DECIMAL,
    stock_status: DataTypes.STRING,
    item_notes: DataTypes.STRING,
    total: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'QuotationItem',
  });
  return QuotationItem;
};