'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // TAMBAHKAN INI: Satu Item Pembelian milik satu Nota Pembelian
      PurchaseItem.belongsTo(models.Purchase, { foreignKey: 'purchase_id' });
      // dan juga milik satu Produk
      PurchaseItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  PurchaseItem.init({
    purchase_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    purchase_price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'PurchaseItem',
  });
  return PurchaseItem;
};