const { Product, PurchaseItem, Purchase, Sequelize } = require('../models');
const { Op } = Sequelize;
const xlsx = require('xlsx'); // <-- Tambahkan ini di paling atas file

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
  console.log(`--- [DEBUG] Memulai update untuk produk ID: ${req.params.id} ---`);
  console.log("Data diterima dari frontend:", req.body);

  try {
    const product = await Product.findByPk(req.params.id);

    if (product) {
      console.log("Data Asli dari DB:", JSON.stringify(product.get({ plain: true }), null, 2));

      // Mengubah nilai properti dari data yang diterima
      product.set(req.body);
      console.log("Data setelah di-set (di memori):", JSON.stringify(product.get({ plain: true }), null, 2));

      // PENTING: Cek apakah Sequelize mendeteksi adanya perubahan
      console.log("Kolom yang berubah:", product.changed());

      if (product.changed()) {
        console.log("Mencoba menyimpan perubahan ke database...");
        await product.save();
        console.log("--- [DEBUG] SUKSES menyimpan ke database. ---");
      } else {
        console.log("--- [DEBUG] Tidak ada perubahan yang terdeteksi, tidak ada yang disimpan. ---");
      }
      
      res.json(product); // Kirim kembali data setelah proses

    } else {
      console.log(`--- [DEBUG] Produk dengan ID ${req.params.id} tidak ditemukan.`);
      res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
  } catch (error) {
    console.error("!!! ERROR di updateProduct:", error);
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

/**
 * FUNGSI PENTING UNTUK RIWAYAT
 * Mengambil riwayat pembelian untuk satu produk spesifik
 */
exports.getProductPurchaseHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseItems = await PurchaseItem.findAll({
      where: { product_id: id },
      include: [{
        model: Purchase,
        attributes: ['purchase_date', 'supplier_name']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(purchaseItems);
  } catch (error) {
    console.error("Error getProductPurchaseHistory:", error);
    res.status(500).json({ message: "Gagal mengambil riwayat pembelian produk" });
  }
};

/**
 * FUNGSI BARU UNTUK IMPOR PRODUK DARI FILE XLSX
 */
exports.importProducts = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }

    // Baca file dari buffer memori
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const errors = [];
    const productsToCreate = [];

    // Validasi setiap baris
    data.forEach((row, index) => {
      const rowNum = index + 2; // Baris di Excel dimulai dari 1, dan baris 1 adalah header
      if (!row['Nama Produk'] || !row['Harga Beli (HPP)'] || !row['Harga Jual'] || !row['Stok'] || !row['Satuan']) {
        errors.push(`Baris ${rowNum}: Kolom wajib (Nama, Harga Beli, Harga Jual, Stok, Satuan) tidak boleh kosong.`);
        return;
      }
      if (isNaN(Number(row['Harga Beli (HPP)'])) || isNaN(Number(row['Harga Jual'])) || isNaN(Number(row['Stok']))) {
          errors.push(`Baris ${rowNum}: Harga dan Stok harus berupa angka.`);
          return;
      }

      productsToCreate.push({
        name: row['Nama Produk'],
        kategori: row['Kategori'] || 'Lainnya',
        merk: row['Merk'] || 'N/A',
        stock: Number(row['Stok']),
        satuan: row['Satuan'],
        hpp: Number(row['Harga Beli (HPP)']),
        sell_price: Number(row['Harga Jual']),
        sku: row['SKU'] || null,
        status: 'listed'
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Ditemukan kesalahan dalam file Anda:', errors });
    }
    
    // Jika tidak ada error, masukkan semua data sekaligus
    await Product.bulkCreate(productsToCreate, { transaction: t });

    await t.commit();
    res.json({ message: `${productsToCreate.length} produk berhasil diimpor.` });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal memproses file impor', error: error.message });
  }
};