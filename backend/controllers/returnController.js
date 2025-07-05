const { SalesReturn, SalesReturnItem, Transaction, Product, sequelize } = require('../models');

/**
 * Membuat Retur Penjualan baru
 */
exports.createSalesReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      transaction_id, 
      return_date, 
      notes,
      items_to_return // Array berisi { product_id, quantity_returned, price_at_return }
    } = req.body;

    if (!transaction_id || !items_to_return || items_to_return.length === 0) {
      return res.status(400).json({ message: "Data retur tidak lengkap." });
    }

    // Hitung total refund
    const total_refund_amount = items_to_return.reduce((sum, item) => {
      return sum + (item.quantity_returned * item.price_at_return);
    }, 0);

    // 1. Buat record SalesReturn utama
    const salesReturn = await SalesReturn.create({
      return_number: `RET-${Date.now()}`,
      transaction_id,
      return_date: return_date || new Date(),
      total_refund_amount,
      notes
    }, { transaction: t });

    // 2. Buat record untuk setiap item yang diretur & kembalikan stok
    for (const item of items_to_return) {
      if (item.quantity_returned > 0) {
        // Buat catatan item retur
        await SalesReturnItem.create({
          sales_return_id: salesReturn.id,
          product_id: item.product_id,
          quantity_returned: item.quantity_returned,
          price_at_return: item.price_at_return
        }, { transaction: t });

        // Kembalikan (tambah) stok produk
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          await product.increment('stock', { by: item.quantity_returned, transaction: t });
        }
      }
    }
    
    // 3. Update status transaksi asli (opsional, bisa ditambahkan nanti)
    // Misalnya, ubah status di tabel Transactions menjadi 'Diretur Sebagian'

    await t.commit();
    res.status(201).json(salesReturn);

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal memproses retur', error: error.message });
  }
};