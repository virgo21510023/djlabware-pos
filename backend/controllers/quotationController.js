const { Quotation, QuotationItem, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Membuat Penawaran Baru
 */
exports.createQuotation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      customer_name, 
      quotation_date, 
      valid_until, 
      items, 
      notes, 
      discount_percentage, 
      shipping_cost, 
      vat_percentage 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Penawaran harus memiliki setidaknya satu item.' });
    }

    // --- Kalkulasi Harga ---
    const subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    const discountAmount = subtotal * ((parseFloat(discount_percentage) || 0) / 100);
    const shippingCostAmount = parseFloat(shipping_cost) || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    const vatAmount = (parseFloat(vat_percentage) > 0) 
      ? subtotalAfterDiscount * (parseFloat(vat_percentage) / 100) 
      : 0;
      
    const grandTotal = subtotalAfterDiscount + shippingCostAmount + vatAmount;

    // 1. Buat record Quotation utama
    const quotation = await Quotation.create({
      quotation_number: `Q-${Date.now()}`,
      customer_name: customer_name || 'Pelanggan',
      quotation_date: quotation_date || new Date(),
      valid_until,
      subtotal,
      discount_percentage: parseFloat(discount_percentage) || 0,
      shipping_cost: shippingCostAmount,
      vat_percentage: parseFloat(vat_percentage) || 0,
      vat_amount: vatAmount,
      grand_total: grandTotal,
      notes,
      status: 'Draft'
    }, { transaction: t });

    // 2. Buat record untuk setiap QuotationItem
    for (const item of items) {
      await QuotationItem.create({
        quotation_id: quotation.id,
        product_id: item.product_id || null,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        stock_status: item.stock_status,
        item_notes: item.item_notes,
        total: (item.quantity || 0) * (item.price || 0)
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(quotation);

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Gagal membuat penawaran", error: error.message });
  }
};

/**
 * Mengambil semua Penawaran (untuk halaman riwayat)
 */
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      order: [['quotation_date', 'DESC']],
    });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil daftar penawaran." });
  }
};

/**
 * Mengambil detail satu Penawaran
 */
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [{
        model: QuotationItem,
        as: 'items',
        include: [{ model: Product }]
      }]
    });
    if (quotation) {
      res.json(quotation);
    } else {
      res.status(404).json({ message: 'Penawaran tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail penawaran' });
  }
};