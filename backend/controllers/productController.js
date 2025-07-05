const { Product, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * Mengambil semua produk dengan paginasi dan pencarian
 * HANYA akan mengambil produk dengan status 'listed'
 */
exports.getAllProducts = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Kondisi filter dasar adalah status 'listed'
    const whereClause = {
      status: 'listed'
    };

    // Tambahkan kondisi pencarian jika ada
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { kategori: { [Op.like]: `%${search}%` } },
        { merk: { [Op.like]: `%${search}%` } }
      ];
    }

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

/**
 * Membuat produk baru (dari menu inventaris)
 * Otomatis akan berstatus 'listed'
 */
exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, status: 'listed' }; // Pastikan statusnya 'listed'
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Gagal membuat produk", error: error.message });
  }
};

/**
 * Memperbarui data produk
 */
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

/**
 * Menghapus produk
 */
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