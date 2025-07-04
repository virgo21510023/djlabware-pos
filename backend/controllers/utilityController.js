const { Product, sequelize } = require('../models');
const { Op } = require('sequelize'); // Perbaikan ada di sini
const terbilang = require('terbilang');

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

exports.getTerbilang = (req, res) => {
  const { amount } = req.query;
  if (!amount) return res.status(400).json({ text: '' });
  const text = terbilang(amount);
  res.json({ text: `${text.charAt(0).toUpperCase() + text.slice(1)} Rupiah` });
};