const { Setting } = require('../models');

// Mengambil semua pengaturan
exports.getSettings = async (req, res) => {
  try {
    const settingsArray = await Setting.findAll();
    // Ubah array menjadi objek agar mudah diakses di frontend
    const settingsObject = settingsArray.reduce((obj, item) => {
      obj[item.key] = item.value;
      return obj;
    }, {});
    res.json(settingsObject);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil pengaturan" });
  }
};

// Memperbarui pengaturan
exports.updateSettings = async (req, res) => {
  const settings = req.body; // Menerima objek { key: value, ... }
  try {
    for (const key in settings) {
      await Setting.upsert({ key, value: settings[key] });
    }
    res.json({ message: "Pengaturan berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui pengaturan" });
  }
};