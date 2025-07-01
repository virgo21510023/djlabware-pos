const { StockEntry, Product, sequelize } = require('../models');

exports.createStockEntry = async (req, res) => {
  // Gunakan transaksi untuk memastikan integritas data
  const t = await sequelize.transaction();
  try {
    const { productId, quantity, supplier, notes } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Produk dan kuantitas harus valid." });
    }

    // 1. Cari produk yang akan ditambah stoknya
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    // 2. Buat catatan di tabel StockEntries
    await StockEntry.create({
      product_id: productId,
      quantity,
      supplier,
      notes,
    }, { transaction: t });

    // 3. Tambah jumlah stok di tabel Products
    await product.increment('stock', { by: quantity, transaction: t });

    // Jika semua berhasil, commit transaksi
    await t.commit();
    res.status(201).json({ message: "Stok berhasil ditambahkan." });

  } catch (error) {
    // Jika ada kegagalan, batalkan semua perubahan
    await t.rollback();
    res.status(500).json({ message: "Gagal mencatat stok masuk", error: error.message });
  }
};