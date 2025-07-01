const { Transaction, TransactionItem, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, payment_method } = req.body;
    const user_id = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Keranjang tidak boleh kosong' });
    }

    let total_amount = 0;
    let total_hpp = 0;
    
    // Validasi stok sebelum proses
    for (const item of items) {
        const product = await Product.findByPk(item.id, { transaction: t });
        if (product.stock < item.quantity) {
            await t.rollback();
            return res.status(400).json({ message: `Stok untuk ${product.name} tidak mencukupi.` });
        }
        total_amount += product.sell_price * item.quantity;
        total_hpp += product.hpp * item.quantity;
    }

    const transaction = await Transaction.create({
      invoice_number: `INV-${Date.now()}`,
      user_id,
      total_amount,
      total_hpp,
      payment_method,
      status: 'Selesai',
      // PASTIKAN BARIS INI ADA
      transaction_date: new Date()
    }, { transaction: t });

    for (const item of items) {
      const product = await Product.findByPk(item.id);
      await TransactionItem.create({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        price_per_item: product.sell_price,
        hpp_per_item: product.hpp
      }, { transaction: t });

      await product.decrement('stock', { by: item.quantity, transaction: t });
    }

    await t.commit();
    res.status(201).json(transaction);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      // Urutkan berdasarkan yang paling baru
      order: [['createdAt', 'DESC']],
      // Sertakan data nama kasir (User) yang terkait
      include: [{
        model: User,
        attributes: ['name'] // Hanya ambil kolom nama
      }]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data transaksi", error: error.message });
  }
};
// Tambahkan fungsi getTransactions, getTransactionById, dll.