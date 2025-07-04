'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeliveryOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Satu Surat Jalan milik satu Invoice
      DeliveryOrder.belongsTo(models.Invoice, { foreignKey: 'invoice_id' });
      // Satu Surat Jalan memiliki banyak Item Surat Jalan
      DeliveryOrder.hasMany(models.DeliveryOrderItem, { foreignKey: 'delivery_order_id', as: 'items' });
    }
  }
  DeliveryOrder.init({
    do_number: DataTypes.STRING,
    invoice_id: DataTypes.INTEGER,
    delivery_date: DataTypes.DATE,
    recipient_name: DataTypes.STRING,
    shipping_address: DataTypes.TEXT,
    vehicle_number: DataTypes.STRING,
    driver_name: DataTypes.STRING,
    notes: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DeliveryOrder',
  });
  return DeliveryOrder;
};