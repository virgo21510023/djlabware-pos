const { Transaction, TransactionItem, Product, User, SalesReturn, SalesReturnItem, sequelize, Op } = require('../models');

/**
 * Membuat transaksi baru
 */
exports.createTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, payment_method, customer_name, amount_paid, is_dp } = req.body;
    const user_id = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Keranjang tidak boleh kosong." });
    }

    let total_amount = 0;
    let total_hpp = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction: t });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stok untuk produk ${product.name} tidak mencukupi.`);
      }
      total_amount += product.sell_price * item.quantity;
      total_hpp += product.hpp * item.quantity;
    }

    const finalAmountPaid = parseFloat(amount_paid) || 0;
    const remainingAmount = is_dp ? total_amount - finalAmountPaid : 0;
    const status = is_dp && remainingAmount > 0 ? 'Belum Lunas' : 'Lunas';

    const transaction = await Transaction.create({
      invoice_number: `INV-${Date.now()}`,
      user_id,
      total_amount,
      total_hpp,
      payment_method,
      status,
      transaction_date: new Date(),
      customer_name: customer_name || 'Pelanggan',
      amount_paid: finalAmountPaid,
      remaining_amount: remainingAmount
    }, { transaction: t });

    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction: t, raw: true });
      await TransactionItem.create({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        price_per_item: product.sell_price,
        hpp_per_item: product.hpp
      }, { transaction: t });

      await Product.decrement('stock', { by: item.quantity, where: { id: item.id }, transaction: t });
    }

    await t.commit();
    
    const finalTransaction = await Transaction.findByPk(transaction.id, {
        include: [{
            model: TransactionItem,
            include: [Product]
        }, {
            model: User,
            attributes: ['name']
        }]
    });

    res.status(201).json(finalTransaction);

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message || "Gagal membuat transaksi" });
  }
};

/**
 * Mengambil semua transaksi dengan filter
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { invoice_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } }
      ];
    }

    if (startDate && endDate) {
      whereClause.transaction_date = {
        [Op.between]: [new Date(startDate), new Date(`${endDate}T23:59:59`)]
      };
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['name']
      }]
    });
    
    res.json(transactions);

  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data transaksi", error: error.message });
  }
};

/**
 * Mengambil detail satu transaksi
 */
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{
        model: TransactionItem,
        include: [{ model: Product }]
      }, {
        model: User,
        attributes: ['name']
      }]
    });
    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail transaksi' });
  }
};

/**
 * Melunasi sisa pembayaran transaksi DP
 */
exports.settleTransaction = async (req, res) => {
  const { amount_paid } = req.body;
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    
    const paidAmount = parseFloat(amount_paid) || 0;

    transaction.amount_paid = (parseFloat(transaction.amount_paid) || 0) + paidAmount;
    transaction.remaining_amount = (parseFloat(transaction.remaining_amount) || 0) - paidAmount;
    
    if (transaction.remaining_amount <= 0) {
      transaction.remaining_amount = 0;
      transaction.status = 'Lunas';
    }
    
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Gagal melunasi transaksi", error: error.message });
  }
};

/**
 * FUNGSI YANG HILANG
 * Mengambil item yang bisa diretur dari sebuah transaksi
 */
exports.getReturnableItems = async (req, res) => {
    try {
    const { transactionId } = req.params;
    
    const originalItems = await TransactionItem.findAll({
      where: { transaction_id: transactionId },
      include: [Product],
      raw: true,
      nest: true,
    });

    const returnedItems = await SalesReturnItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity_returned')), 'total_returned']
      ],
      include: [{
        model: SalesReturn,
        attributes: [],
        where: { transaction_id: transactionId }
      }],
      group: ['product_id'],
      raw: true
    });
    
    const returnableItems = originalItems.map(item => {
      const foundReturned = returnedItems.find(r => r.product_id === item.product_id);
      const totalReturned = foundReturned ? parseFloat(foundReturned.total_returned) : 0;
      return {
        ...item,
        quantity_purchased: item.quantity,
        quantity_already_returned: totalReturned,
        max_returnable: item.quantity - totalReturned
      };
    });

    res.json(returnableItems);

  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data item retur", error: error.message });
  }
};