const { Product, sequelize } = require('../models');
const { Op } = require('sequelize'); // Perbaikan ada di sini

// Mengambil semua kategori unik
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('kategori')), 'kategori']
      ],
      where: {
        kategori: { 
          [Op.ne]: null, 
          [Op.ne]: '' 
        }
      },
      order: [['kategori', 'ASC']]
    });
    res.json(categories.map(c => c.kategori));
  } catch (error) {
    console.error("!!! ERROR di getAllCategories:", error);
    res.status(500).json([]);
  }
};

// Mengambil semua merk unik
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Product.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('merk')), 'merk']
      ],
      where: {
        merk: { 
          [Op.ne]: null, 
          [Op.ne]: '' 
        }
      },
      order: [['merk', 'ASC']]
    });
    res.json(brands.map(b => b.merk));
  } catch (error) {
    console.error("!!! ERROR di getAllBrands:", error);
    res.status(500).json([]);
  }
};