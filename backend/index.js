require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize } = require('./models'); 
const allRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Arahkan semua permintaan API ke /api TERLEBIH DAHULU
app.use('/api', allRoutes);

// 2. Sajikan file statis (seperti logo, CSS, JS hasil build) dari folder public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'app')));

// 3. Rute "tangkap semua" (SOLUSI STACK OVERFLOW) di POSISI PALING AKHIR
// Ini akan menangani semua permintaan halaman (seperti /inventory, /pos)
// dan menyajikan aplikasi Vue utama.
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app', 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
