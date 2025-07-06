'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // TAMBAHKAN INI: Satu nota Pembelian memiliki banyak Item Pembelian
      Purchase.hasMany(models.PurchaseItem, { foreignKey: 'purchase_id', as: 'items' });
    }
  }
  Purchase.init({
    invoice_number: DataTypes.STRING,
    purchase_date: DataTypes.DATE,
    supplier_name: DataTypes.STRING,
    total_amount: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Purchase',
  });
  return Purchase;
};