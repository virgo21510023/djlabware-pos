'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeliveryOrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definisikan relasi di sini
      DeliveryOrderItem.belongsTo(models.DeliveryOrder, { foreignKey: 'delivery_order_id' });
      DeliveryOrderItem.belongsTo(models.InvoiceItem, { foreignKey: 'invoice_item_id' });
      // TAMBAHKAN INI: Satu item DO juga merujuk ke satu produk
      DeliveryOrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  DeliveryOrderItem.init({
    delivery_order_id: DataTypes.INTEGER,
    invoice_item_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    quantity_shipped: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'DeliveryOrderItem',
  });
  return DeliveryOrderItem;
};