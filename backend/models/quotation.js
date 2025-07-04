'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quotation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Satu Penawaran memiliki banyak Item Penawaran
      Quotation.hasMany(models.QuotationItem, { foreignKey: 'quotation_id', as: 'items' });
      Quotation.hasOne(models.Invoice, { foreignKey: 'quotation_id' });
    }
  }
  Quotation.init({
    quotation_number: DataTypes.STRING,
    quotation_date: DataTypes.DATE,
    customer_name: DataTypes.STRING,
    valid_until: DataTypes.DATE,
    subtotal: DataTypes.DECIMAL,
    discount_percentage: DataTypes.DECIMAL, // <-- Seperti ini
    shipping_cost: DataTypes.DECIMAL,
    vat_amount: DataTypes.DECIMAL,
    grand_total: DataTypes.DECIMAL,
    notes: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Quotation',
  });
  return Quotation;
};
