const { SalesReturn, SalesReturnItem, Product, Transaction, TransactionItem, sequelize } = require('../models');

/**
 * Membuat Retur Penjualan baru dan mengoreksi data finansial
 */
exports.createSalesReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      transaction_id, 
      return_date, 
      notes,
      items_to_return
    } = req.body;

    if (!transaction_id || !items_to_return || items_to_return.length === 0) {
      return res.status(400).json({ message: "Data retur tidak lengkap." });
    }

    let total_refund_amount = 0;
    let total_refund_hpp = 0;

    for (const item of items_to_return) {
      if (item.quantity_returned > 0) {
        total_refund_amount += item.quantity_returned * item.price_at_return;
        
        const product = await Product.findByPk(item.product_id, { transaction: t, attributes: ['hpp'] });
        if (product) {
          total_refund_hpp += item.quantity_returned * product.hpp;
        }
      }
    }
    
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
        await SalesReturnItem.create({
          sales_return_id: salesReturn.id,
          product_id: item.product_id,
          quantity_returned: item.quantity_returned,
          price_at_return: item.price_at_return
        }, { transaction: t });

        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          await product.increment('stock', { by: item.quantity_returned, transaction: t });
        }
      }
    }
    
    // 3. LOGIKA BARU UNTUK STATUS
    const originalTransaction = await Transaction.findByPk(transaction_id, { transaction: t });
    if(originalTransaction) {
        originalTransaction.total_amount -= total_refund_amount;
        originalTransaction.total_hpp -= total_refund_hpp;
        
        // Hitung total quantity yang dibeli di transaksi asli
        const originalItemsQty = await TransactionItem.sum('quantity', { where: { transaction_id }, transaction: t });

        // Hitung total SEMUA item yang diretur untuk transaksi ini, TERMASUK YANG BARU DIBUAT
        const totalReturnedQty = await SalesReturnItem.sum('quantity_returned', {
          include: [{
            model: SalesReturn,
            attributes: [],
            where: { transaction_id }
          }],
          transaction: t
        });

        // Jika total semua retur >= total pembelian, maka retur penuh
        if (totalReturnedQty >= originalItemsQty) {
          originalTransaction.status = 'Diretur Penuh';
        } else {
          originalTransaction.status = 'Diretur Sebagian';
        }
        await originalTransaction.save({ transaction: t });
    }

    await t.commit();
    res.status(201).json(salesReturn);

  } catch (error) {
    await t.rollback();
    console.error("Error di createSalesReturn:", error);
    res.status(500).json({ message: 'Gagal memproses retur', error: error.message });
  }
};