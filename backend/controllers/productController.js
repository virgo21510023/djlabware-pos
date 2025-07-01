const { Product, Sequelize } = require('../models');
const { Op } = Sequelize;

// GET All Products
exports.getAllProducts = async (req, res) => {
  // Ambil page dan limit dari query, beri nilai default
  const { search, page = 1, limit = 10 } = req.query; 
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { kategori: { [Op.like]: `%${search}%` } },
        { merk: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    // Gunakan findAndCountAll untuk paginasi
    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['name', 'ASC']]
    });

    res.json({
      totalItems: count,
      products: rows,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CREATE Product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Gagal membuat produk", error: error.message });
  }
};

// UPDATE Product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update(req.body);
      res.json(product);
    } else {
      res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Gagal memperbarui produk', error: error.message });
  }
};

// DELETE Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
      res.json({ message: 'Produk berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus produk', error: error.message });
  }
};