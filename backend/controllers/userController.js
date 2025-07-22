const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Mengambil semua pengguna
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      // Jangan pernah kirim password ke frontend
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pengguna", error: error.message });
  }
};

// Membuat pengguna baru (hanya Kasir)
exports.createUser = async (req, res) => {
  // Ambil 'role' dari body, beri default 'Kasir' jika kosong
  const { name, username, password, role = 'Kasir' } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Nama, username, dan password harus diisi' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      username,
      password: hashedPassword,
      role // Gunakan role dari request
    });

    const userResponse = { ...newUser.get() };
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: 'Gagal membuat pengguna', error: error.message });
  }
};

// Menghapus pengguna
exports.deleteUser = async (req, res) => {
  try {
    // Tambahkan validasi agar admin tidak bisa menghapus dirinya sendiri
    if (req.user.id == req.params.id) {
      return res.status(400).json({ message: "Anda tidak dapat menghapus akun Anda sendiri." });
    }
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'Pengguna berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pengguna', error: error.message });
  }
};