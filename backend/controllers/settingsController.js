const { Setting } = require('../models');

/**
 * Mengambil semua pengaturan dari database
 */
exports.getSettings = async (req, res) => {
  try {
    const settingsArray = await Setting.findAll();
    
    // Ubah array dari database menjadi sebuah objek tunggal
    // Contoh: [{key: 'store_name', value: 'Toko A'}] menjadi { store_name: 'Toko A' }
    const settingsObject = settingsArray.reduce((obj, item) => {
      obj[item.key] = item.value;
      return obj;
    }, {});

    res.json(settingsObject);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil pengaturan", error: error.message });
  }
};

/**
 * Memperbarui atau membuat pengaturan baru
 */
exports.updateSettings = async (req, res) => {
  // Menerima satu objek berisi semua pengaturan dari frontend
  const settingsToUpdate = req.body; 
  
  try {
    // Loop melalui setiap key di dalam objek
    for (const key in settingsToUpdate) {
      if (Object.hasOwnProperty.call(settingsToUpdate, key)) {
        const value = settingsToUpdate[key];
        
        // Gunakan 'upsert': 
        // - Jika key sudah ada, 'update' nilainya.
        // - Jika key belum ada, 'insert' baris baru.
        await Setting.upsert({ key, value });
      }
    }
    res.json({ message: "Pengaturan berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui pengaturan", error: error.message });
  }
};

/**
 * Menangani unggahan logo
 */
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }

    // Simpan path file ke database
    const logoPath = `/uploads/${req.file.filename}`;
    await Setting.upsert({ key: 'store_logo', value: logoPath });

    res.json({ message: 'Logo berhasil diunggah', filePath: logoPath });

  } catch (error) {
    res.status(500).json({ message: 'Gagal mengunggah logo', error: error.message });
  }
};