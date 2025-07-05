const { PurchaseOrder, PurchaseOrderItem, Product, sequelize } = require('../models');

/**
 * Membuat Purchase Order baru
 */
exports.createPurchaseOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      supplier_name, order_date, expected_delivery_date, notes, items, 
      discount_percentage, vat_percentage 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Purchase Order harus memiliki setidaknya satu item." });
    }

    // --- Kalkulasi Harga ---
    const subtotal = items.reduce((sum, item) => sum + ((item.quantity_ordered || 0) * (item.estimated_price || 0)), 0);
    const discountAmount = subtotal * ((parseFloat(discount_percentage) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const vatAmount = subtotalAfterDiscount * ((parseFloat(vat_percentage) || 0) / 100);
    const grandTotal = subtotalAfterDiscount + vatAmount;

    // 1. Buat record Purchase Order utama
    const purchaseOrder = await PurchaseOrder.create({
      po_number: `PO-${Date.now()}`,
      supplier_name: supplier_name || 'N/A',
      order_date: order_date || new Date(),
      expected_delivery_date,
      notes,
      subtotal,
      discount_percentage: parseFloat(discount_percentage) || 0,
      vat_percentage: parseFloat(vat_percentage) || 0,
      grand_total: grandTotal,
      status: 'Dipesan'
    }, { transaction: t });

    // 2. Proses setiap item dalam PO
    for (const item of items) {
      let product;
      if (item.is_new) {
        product = await Product.create({
          name: item.name,
          sku: `SKU-PO-${Date.now()}`,
          stock: 0,
          hpp: item.estimated_price,
          sell_price: 0,
          kategori: item.kategori,
          merk: item.merk,
          satuan: item.satuan,
          status: 'unlisted'
        }, { transaction: t });
      } else {
        product = await Product.findByPk(item.product_id, { transaction: t });
      }

      if (!product) throw new Error(`Produk untuk item "${item.name}" tidak valid.`);

      await PurchaseOrderItem.create({
        purchase_order_id: purchaseOrder.id,
        product_id: product.id,
        quantity_ordered: item.quantity_ordered,
        estimated_price: item.estimated_price
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json(purchaseOrder);

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal membuat Purchase Order', error: error.message });
  }
};

/**
 * Mengambil semua Purchase Order
 */
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.findAll({
      order: [['order_date', 'DESC']],
    });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil daftar Purchase Order.' });
  }
};

/**
 * Mengambil detail satu Purchase Order
 */
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
      include: [{
        model: PurchaseOrderItem,
        as: 'items',
        include: [{ model: Product, attributes: ['name', 'merk', 'satuan'] }]
      }]
    });
    if (purchaseOrder) {
      res.json(purchaseOrder);
    } else {
      res.status(404).json({ message: 'Purchase Order tidak ditemukan.' });
    }
  } catch (error) {
    console.error("Error di getPurchaseOrderById:", error);
    res.status(500).json({ message: 'Gagal mengambil detail Purchase Order.' });
  }
};