const { Transaction, Product, SalesReturn, SalesReturnItem, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Mengambil Laporan Penjualan berdasarkan rentang tanggal
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Rentang tanggal harus diisi" });
    }
    
    const dateFilter = {
      transaction_date: {
        [Op.between]: [new Date(startDate), new Date(`${endDate}T23:59:59`)]
      }
    };
    
    const returnDateFilter = {
      return_date: {
        [Op.between]: [new Date(startDate), new Date(`${endDate}T23:59:59`)]
      }
    };

    const salesReport = await Transaction.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'grossOmzet'],
        [sequelize.fn('SUM', sequelize.col('total_hpp')), 'grossHpp'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']
      ],
      where: dateFilter,
      raw: true
    });

    const returns = await SalesReturn.findAll({
      where: returnDateFilter,
      include: [{
        model: SalesReturnItem,
        as: 'items',
        include: [{ model: Product, attributes: ['hpp'] }]
      }]
    });

    let totalRefund = 0;
    let totalHppReturned = 0;
    returns.forEach(ret => {
      totalRefund += parseFloat(ret.total_refund_amount);
      ret.items.forEach(item => {
        totalHppReturned += item.quantity_returned * (item.Product?.hpp || 0);
      });
    });

    const grossOmzet = parseFloat(salesReport?.grossOmzet) || 0;
    const grossHpp = parseFloat(salesReport?.grossHpp) || 0;

    const netOmzet = grossOmzet - totalRefund;
    const netHpp = grossHpp - totalHppReturned;
    const netLabaKotor = netOmzet - netHpp;

    const paymentMethodSummary = await Transaction.findAll({
      attributes: [
        'payment_method',
        [sequelize.fn('COUNT', sequelize.col('payment_method')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount_paid')), 'total_nominal']
      ],
      where: {
        updatedAt: {
          [Op.between]: [new Date(startDate), new Date(`${endDate}T23:59:59`)]
        }
      },
      group: ['payment_method'],
      raw: true
    });

    res.json({
      totalOmzet: netOmzet,
      labaKotor: netLabaKotor,
      totalTransactions: parseInt(salesReport?.totalTransactions) || 0,
      totalRefund: totalRefund,
      paymentMethodSummary
    });

  } catch (error) {
    console.error("Error di getSalesReport:", error);
    res.status(500).json({ message: "Gagal mengambil data laporan", error: error.message });
  }
};

/**
 * Mengambil ringkasan data untuk halaman Dashboard
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const cashflowToday = await Transaction.sum('amount_paid', {
      where: {
        updatedAt: { [Op.between]: [todayStart, todayEnd] }
      }
    });

    const totalTransactionsToday = await Transaction.count({
      where: {
        transaction_date: { [Op.between]: [todayStart, todayEnd] }
      }
    });

    const recentProducts = await Product.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    const criticalStockCount = await Product.count({
      where: { stock: { [Op.lte]: 5 } }
    });

    res.json({
      totalOmzetToday: parseFloat(cashflowToday) || 0,
      totalTransactionsToday,
      recentProducts,
      criticalStockCount
    });

  } catch (error) {
    console.error("Error di getDashboardSummary:", error);
    res.status(500).json({ message: "Gagal mengambil data dashboard", error: error.message });
  }
};