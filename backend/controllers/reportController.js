const { Transaction, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getSalesReport = async (req, res) => {
  // Fungsi ini kita biarkan, tidak diubah
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Rentang tanggal harus diisi" });
    }
    const report = await Transaction.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalOmzet'],
        [sequelize.fn('SUM', sequelize.col('total_hpp')), 'totalHpp'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']
      ],
      where: {
        transaction_date: { [Op.between]: [new Date(startDate), new Date(endDate)] },
        status: 'Selesai'
      },
      raw: true
    });
    const grossProfit = (report.totalOmzet || 0) - (report.totalHpp || 0);
    res.json({
      totalOmzet: parseFloat(report.totalOmzet) || 0,
      labaKotor: grossProfit,
      totalTransactions: parseInt(report.totalTransactions) || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data laporan", error: error.message });
  }
};


// KITA FOKUS PADA FUNGSI INI
exports.getDashboardSummary = async (req, res) => {
  console.log("--- [DEBUG] Memulai getDashboardSummary ---");
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    console.log("--- [DEBUG] 1. Mencoba query ringkasan transaksi...");
    const todaySummary = await Transaction.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalOmzetToday'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactionsToday']
      ],
      where: {
        transaction_date: { [Op.between]: [todayStart, todayEnd] },
        status: 'Selesai'
      },
      raw: true
    });
    console.log("--- [DEBUG] 1. SUKSES mengambil ringkasan transaksi.");

    console.log("--- [DEBUG] 2. Mencoba query produk terbaru...");
    const recentProducts = await Product.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    console.log("--- [DEBUG] 2. SUKSES mengambil produk terbaru.");

    console.log("--- [DEBUG] 3. Mencoba query stok kritis...");
    const criticalStockCount = await Product.count({
      where: { stock: { [Op.lte]: 5 } }
    });
    console.log("--- [DEBUG] 3. SUKSES menghitung stok kritis.");

    res.json({
      totalOmzetToday: parseFloat(todaySummary?.totalOmzetToday) || 0,
      totalTransactionsToday: parseInt(todaySummary?.totalTransactionsToday) || 0,
      recentProducts,
      criticalStockCount
    });

  } catch (error) {
    console.error("!!!   [DEBUG] TERJADI ERROR DI getDashboardSummary   !!!");
    console.error(error); // Ini akan mencetak detail error yang sebenarnya
    res.status(500).json({ message: "Terjadi error di server", error: error.message });
  }
};