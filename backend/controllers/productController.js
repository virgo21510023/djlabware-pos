const { Product, Sequelize } = require('../models');
const { Op } = Sequelize;

// GET All Products (sudah ada)
exports.getAllProducts = async (req, res) => {
  // ... (kode yang sudah ada, tidak perlu diubah)
  const { search, page = 1, limit = 1000 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      totalItems: count,
      products: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE Product (tambahkan/pastikan kode ini ada)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    // Kirim pesan error yang lebih spesifik jika ada
    res.status(400).json({ message: "Gagal membuat produk", error: error.message });
  }
};

// Tambahkan fungsi getProductById, updateProduct, deleteProduct nanti...