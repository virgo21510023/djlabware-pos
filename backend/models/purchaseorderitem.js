'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseOrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PurchaseOrderItem.belongsTo(models.PurchaseOrder, { foreignKey: 'purchase_order_id' });
      PurchaseOrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  PurchaseOrderItem.init({
    purchase_order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity_ordered: DataTypes.DECIMAL,
    estimated_price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'PurchaseOrderItem',
  });
  return PurchaseOrderItem;
};