const { Transaction, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Mengambil Laporan Penjualan berdasarkan rentang tanggal
 * Dihitung berdasarkan kapan transaksi DIBUAT (prinsip akrual)
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Rentang tanggal harus diisi" });
    }

    const salesReport = await Transaction.findOne({
      attributes: [
        // Omzet adalah total nilai barang yang terjual dalam periode ini
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalOmzet'],
        // HPP dicocokkan dengan penjualan di periode yang sama
        [sequelize.fn('SUM', sequelize.col('total_hpp')), 'totalHpp'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']
      ],
      where: {
        // Filter berdasarkan tanggal transaksi dibuat
        transaction_date: {
          [Op.between]: [new Date(startDate), new Date(`${endDate}T23:59:59`)]
        }
      },
      raw: true
    });

    const totalOmzet = parseFloat(salesReport?.totalOmzet) || 0;
    const totalHpp = parseFloat(salesReport?.totalHpp) || 0;
    const labaKotor = totalOmzet - totalHpp;

    res.json({
      totalOmzet,
      labaKotor,
      totalTransactions: parseInt(salesReport?.totalTransactions) || 0,
    });

  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data laporan", error: error.message });
  }
};

/**
 * Mengambil ringkasan data untuk halaman Dashboard
 * Dihitung berdasarkan UANG MASUK hari ini (prinsip kas)
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Menghitung total uang yang sudah dibayarkan hari ini
    const cashflowToday = await Transaction.sum('amount_paid', {
      where: {
        // Filter berdasarkan kapan transaksi di-update (termasuk pelunasan)
        updatedAt: {
          [Op.between]: [todayStart, todayEnd]
        }
      }
    });

    // Menghitung jumlah transaksi yang dibuat hari ini
    const totalTransactionsToday = await Transaction.count({
      where: {
        transaction_date: {
          [Op.between]: [todayStart, todayEnd]
        }
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
      totalOmzetToday: parseFloat(cashflowToday) || 0, // Ini adalah arus kas masuk hari ini
      totalTransactionsToday,
      recentProducts,
      criticalStockCount
    });

  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data dashboard", error: error.message });
  }
};