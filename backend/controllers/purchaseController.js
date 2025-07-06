const { Purchase, PurchaseItem, Product, PurchaseOrder, sequelize, Op } = require('../models');

exports.createPurchase = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      invoice_number, 
      purchase_date, 
      supplier_name, 
      items,
      purchase_order_id
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Harus ada setidaknya satu item." });
    }

    const totalAmount = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.purchase_price || 0)), 0);

    const purchase = await Purchase.create({
      invoice_number: invoice_number || `NOTA-${Date.now()}`,
      purchase_date: purchase_date || new Date(),
      supplier_name: supplier_name || 'N/A',
      total_amount: totalAmount
    }, { transaction: t });

    for (const item of items) {
      let product;
      
      if (item.is_new) {
        product = await Product.create({
          name: item.name,
          sku: item.sku || `SKU-${Date.now()}`,
          stock: 0,
          hpp: Number(item.purchase_price || 0),
          sell_price: Number(item.sell_price || 0),
          kategori: item.kategori || 'Lainnya',
          merk: item.merk || 'N/A',
          satuan: item.satuan || 'Pcs',
          status: 'listed'
        }, { transaction: t });
      } else {
        // PERBAIKAN: Pastikan product_id ada sebelum mencari
        if (!item.product_id) {
          throw new Error(`ID Produk tidak valid untuk item: ${item.name}. Harap pilih dari daftar.`);
        }
        product = await Product.findByPk(item.product_id, { transaction: t });
      }

      if (!product) {
        throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan.`);
      }
      
      await PurchaseItem.create({
        purchase_id: purchase.id,
        product_id: product.id,
        quantity: Number(item.quantity),
        purchase_price: Number(item.purchase_price)
      }, { transaction: t });

      await product.increment('stock', { by: Number(item.quantity), transaction: t });
      
      await product.update({
        hpp: Number(item.purchase_price),
        sell_price: Number(item.sell_price),
        kategori: item.kategori,
        merk: item.merk,
        satuan: item.satuan,
        status: 'listed'
      }, { transaction: t });
    }
    
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
    console.error("Error di createPurchase:", error);
    res.status(500).json({ message: 'Gagal mencatat pembelian', error: error.message });
  }
};


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