const { Purchase, PurchaseItem, Product, PurchaseOrder, sequelize } = require('../models');

/**
 * Membuat data Pembelian baru, bisa dari PO atau manual
 */
exports.createPurchase = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      invoice_number, 
      purchase_date, 
      supplier_name, 
      items,
      purchase_order_id // Menerima ID PO jika ada
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Harus ada setidaknya satu item." });
    }

    // Kalkulasi total pembelian
    const subtotal = items.reduce((sum, item) => sum + (item.quantity_ordered * item.estimated_price), 0);
    const discountAmount = subtotal * ((parseFloat(discount_percentage) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const vatAmount = subtotalAfterDiscount * ((parseFloat(vat_percentage) || 0) / 100);
    const grandTotal = subtotalAfterDiscount + vatAmount;

    // 1. Buat record Purchase utama
    const purchaseOrder = await PurchaseOrder.create({
      po_number: `PO-${Date.now()}`,
      supplier_name,
      order_date,
      expected_delivery_date,
      notes,
      subtotal,
      discount_percentage: parseFloat(discount_percentage) || 0,
      vat_percentage: parseFloat(vat_percentage) || 0,
      grand_total: grandTotal,
      status: 'Dipesan'
    }, { transaction: t });

    // 2. Proses setiap item
    for (const item of items) {
      let product;
      // Cek jika ini produk baru
      if (item.is_new) {
        product = await Product.create({
          name: item.name,
          sku: item.sku || `SKU-${Date.now()}`,
          stock: 0,
          hpp: item.purchase_price || 0,
          sell_price: item.sell_price || 0,
          kategori: item.kategori || 'Lainnya',
          merk: item.merk || 'N/A',
          satuan: item.satuan || 'Pcs',
          status: 'listed' // Produk baru dari pembelian langsung di-list
        }, { transaction: t });
      } else {
        product = await Product.findByPk(item.product_id, { transaction: t });
      }

      if (!product) {
        throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan.`);
      }
      
      // 3. Buat record PurchaseItem
      await PurchaseItem.create({
        purchase_id: purchase.id,
        product_id: product.id,
        quantity: item.quantity,
        purchase_price: item.purchase_price
      }, { transaction: t });

      // 4. Update stok, HPP, dan harga jual produk
      await product.increment('stock', { by: item.quantity, transaction: t });
      if(item.purchase_price > 0 && item.sell_price > 0) {
        await product.update({
          hpp: item.purchase_price,
          sell_price: item.sell_price,
          status: 'listed' // Pastikan statusnya 'listed' saat barang masuk
        }, { transaction: t });
      }
    }
    
    // Jika pembelian ini dibuat dari sebuah PO, update status PO menjadi 'Selesai'
    if (purchase_order_id) {
      const po = await PurchaseOrder.findByPk(purchase_order_id, { transaction: t });
      if (po) {
        po.status = 'Selesai';
        await po.save({ transaction: t });
      }
    }

    await t.commit();
    res.status(201).json({ message: 'Pembelian berhasil dicatat.' });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal mencatat pembelian', error: error.message });
  }
};


/**
 * Mengambil semua nota pembelian (untuk riwayat)
 */
exports.getAllPurchases = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { invoice_number: { [Op.like]: `%${search}%` } },
        { supplier_name: { [Op.like]: `%${search}%` } }
      ];
    }

    if (startDate && endDate) {
      whereClause.purchase_date = {
        [Op.between]: [new Date(startDate), new Date(`${endDate}T23:59:59`)]
      };
    }

    const purchases = await Purchase.findAll({
      where: whereClause,
      order: [['purchase_date', 'DESC']]
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat pembelian.' });
  }
};


/**
 * Mengambil detail satu nota pembelian
 */
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{
        model: PurchaseItem,
        as: 'items',
        include: [{ model: Product }]
      }]
    });
    if (purchase) {
      res.json(purchase);
    } else {
      res.status(404).json({ message: 'Nota pembelian tidak ditemukan.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail pembelian.' });
  }
};