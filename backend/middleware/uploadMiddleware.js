const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Konfigurasi untuk Logo ---
const logoUploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(logoUploadDir)){
    fs.mkdirSync(logoUploadDir, { recursive: true });
}

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const logoFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG) yang diizinkan!'), false);
  }
};

// --- Konfigurasi untuk File Impor (Excel) ---
const importStorage = multer.memoryStorage();

const importFileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file Excel (.xlsx) atau CSV yang diizinkan!'), false);
    }
};

// Ekspor setiap konfigurasi secara terpisah
exports.uploadLogo = multer({ 
  storage: logoStorage,
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter: logoFileFilter
});

exports.uploadImportFile = multer({
    storage: importStorage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: importFileFilter
});