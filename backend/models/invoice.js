'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Invoice.hasMany(models.InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
      Invoice.belongsTo(models.Quotation, { foreignKey: 'quotation_id' });
      Invoice.hasMany(models.Payment, { foreignKey: 'invoice_id', as: 'payments' });
      Invoice.hasMany(models.DeliveryOrder, { foreignKey: 'invoice_id', as: 'delivery_orders' });
    }
  }
  Invoice.init({
    invoice_number: DataTypes.STRING,
    quotation_id: DataTypes.INTEGER,
    invoice_date: DataTypes.DATE,
    due_date: DataTypes.DATE,
    customer_name: DataTypes.STRING,
    subtotal: DataTypes.DECIMAL,
    discount_percentage: DataTypes.DECIMAL,
    shipping_cost: DataTypes.DECIMAL,
    vat_amount: DataTypes.DECIMAL,
    grand_total: DataTypes.DECIMAL,
    amount_paid: DataTypes.DECIMAL,
    amount_due: DataTypes.DECIMAL,
    payment_method: DataTypes.STRING,
    payment_terms: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};