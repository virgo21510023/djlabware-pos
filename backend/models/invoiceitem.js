'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'invoice_id' });
      InvoiceItem.belongsTo(models.Product, { foreignKey: 'product_id' });
      InvoiceItem.hasMany(models.DeliveryOrderItem, { foreignKey: 'invoice_item_id', as: 'shipments' });
    }
  }
  InvoiceItem.init({
    invoice_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    quantity: DataTypes.DECIMAL,
    price: DataTypes.DECIMAL,
    total: DataTypes.DECIMAL,
    stock_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'InvoiceItem',
  });
  return InvoiceItem;
};