'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definisikan relasi di sini
      PurchaseOrder.hasMany(models.PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items' });
    }
  }
  PurchaseOrder.init({
    po_number: DataTypes.STRING,
    supplier_name: DataTypes.STRING,
    order_date: DataTypes.DATE,
    expected_delivery_date: DataTypes.DATE,
    notes: DataTypes.TEXT,
    status: DataTypes.STRING,
    // Kolom finansial yang baru ditambahkan
    subtotal: DataTypes.DECIMAL,
    discount_percentage: DataTypes.DECIMAL,
    vat_percentage: DataTypes.DECIMAL,
    grand_total: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'PurchaseOrder',
  });
  return PurchaseOrder;
};