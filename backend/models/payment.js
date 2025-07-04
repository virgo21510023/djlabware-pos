'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Payment.belongsTo(models.Invoice, { foreignKey: 'invoice_id' });
    }
  }
  Payment.init({
    invoice_id: DataTypes.INTEGER,
    payment_date: DataTypes.DATE,
    amount: DataTypes.DECIMAL,
    method: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};