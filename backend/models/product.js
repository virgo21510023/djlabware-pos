'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.TransactionItem, { foreignKey: 'product_id' });
      Product.hasMany(models.StockEntry, { foreignKey: 'product_id' });
      Product.hasMany(models.QuotationItem, { foreignKey: 'product_id' });
      Product.hasMany(models.DeliveryOrderItem, { foreignKey: 'product_id' });
      Product.hasMany(models.SalesReturnItem, { foreignKey: 'product_id' });
    }
  }
  Product.init({
    // Kolom-kolom ini harus sesuai dengan tabel database Anda
    sku: DataTypes.STRING,
    name: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    hpp: DataTypes.DECIMAL,
    sell_price: DataTypes.DECIMAL,
    
    // Ini adalah kolom-kolom baru yang kita tambahkan
    satuan: DataTypes.STRING,
    merk: DataTypes.STRING,
    kategori: DataTypes.STRING
    
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};