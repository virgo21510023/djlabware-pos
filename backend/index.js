require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Baris ini akan menginisialisasi koneksi database dari models/index.js
// models/index.js yang akan membaca config.json dengan benar
const { sequelize } = require('./models'); 

const allRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis dari folder 'public' (untuk logo)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', allRoutes);

app.get('/', (req, res) => {
  res.send('DJLabware POS API is running...');
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