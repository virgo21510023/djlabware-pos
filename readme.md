djlabware POS - Aplikasi Point of Sale Modern
<!-- Ganti dengan screenshot aplikasi Anda -->

Selamat datang di djlabware POS, sebuah aplikasi Point of Sale (POS) berbasis web yang modern, dibangun dari nol untuk memenuhi kebutuhan manajemen toko bahan kimia, laboratorium, atau bisnis sejenis. Aplikasi ini mencakup alur kerja bisnis yang lengkap, dari inventaris dan penjualan hingga pembuatan dokumen profesional seperti penawaran dan invoice.

✨ Fitur Utama
Aplikasi ini dirancang untuk menangani seluruh siklus operasional bisnis Anda:

🖥️ Dashboard Informatif: Ringkasan performa bisnis harian, termasuk penjualan, transaksi, dan produk kritis.

🛒 Kasir (POS) Canggih: Antarmuka penjualan cepat dengan pencarian produk, keranjang dinamis, dan berbagai metode pembayaran (Tunai, DP, QRIS, Transfer) serta pencetakan struk.

📦 Manajemen Inventaris: Fitur CRUD lengkap untuk produk, dilengkapi master-detail view untuk melihat riwayat harga beli.

🚚 Alur Kerja Pembelian Lengkap:

Purchase Order (PO): Buat dokumen pemesanan ke supplier.

Penerimaan Barang: Konversi PO menjadi Form Pembelian secara otomatis untuk memperbarui stok dan HPP.

📄 Alur Kerja Penjualan Profesional:

Penawaran (Quotation): Buat penawaran profesional dengan diskon, PPN, dan opsi stok (Ready/PO).

Invoice: Konversi Penawaran menjadi Invoice resmi, yang secara otomatis memotong stok.

Surat Jalan (Delivery Order): Buat Surat Jalan dari Invoice, mendukung pengiriman parsial.

📈 Laporan Bisnis: Analisis omzet bersih dan laba kotor dengan filter rentang tanggal, sudah memperhitungkan retur.

↩️ Manajemen Retur: Alur kerja untuk memproses retur penjualan yang terintegrasi, mengembalikan stok dan mengoreksi laporan secara otomatis.

👥 Manajemen Pengguna: Kelola akun dengan peran Admin dan Kasir.

⚙️ Pengaturan Fleksibel:

Atur informasi toko, rekening bank, dan catatan dokumen.

Unggah logo perusahaan.

Pilih format cetak (Thermal 58mm / A5 Landscape).

Ubah tema tampilan (Light/Dark/Sistem) dan atur tingkat zoom.

🚀 Teknologi yang Digunakan
Backend: Node.js, Express.js, Sequelize (ORM), MariaDB/MySQL

Frontend: Vue.js, Vite, Pinia (State Management), Vue Router, Tailwind CSS

Autentikasi: JSON Web Tokens (JWT)

Lainnya: multer untuk unggah file, xlsx untuk impor data, jsPDF & html2canvas untuk ekspor PDF.

🛠️ Instalasi & Pengaturan
Ikuti langkah-langkah ini untuk menjalankan aplikasi di lingkungan pengembangan.

Prasyarat
Pastikan perangkat Anda sudah terinstal:

Node.js (versi LTS direkomendasikan)

Git

Server Database seperti XAMPP (yang sudah termasuk MariaDB/MySQL dan Apache).

1. Backend Setup
# 1. Masuk ke direktori backend
cd backend

# 2. Instal semua dependensi
npm install

# 3. Salin file .env.example menjadi .env
# cp .env.example .env

# 4. Buka file .env dan sesuaikan dengan konfigurasi database Anda
# Contoh isi .env:
# PORT=5000
# DB_HOST=127.0.0.1
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=djlabware_pos
# JWT_SECRET=rahasia-anda-yang-sangat-aman

# 5. Buka aplikasi database Anda (misal: phpMyAdmin) dan buat database baru
# dengan nama yang sama seperti di file .env (contoh: djlabware_pos)

# 6. Jalankan migrasi untuk membuat semua tabel
npx sequelize-cli db:migrate

# 7. Jalankan seeder untuk membuat akun admin awal
npx sequelize-cli db:seed:all

2. Frontend Setup
# 1. Buka terminal baru, masuk ke direktori frontend
cd frontend

# 2. Instal semua dependensi
npm install

💻 Menjalankan Aplikasi (Mode Pengembangan)
Anda perlu menjalankan dua terminal secara bersamaan.

Terminal 1 (Backend):

cd backend
npm run dev

Server backend akan berjalan di http://localhost:5000.

Terminal 2 (Frontend):

cd frontend
npm run dev

Aplikasi frontend akan berjalan di http://localhost:5173. Buka alamat ini di browser Anda.

Login Awal:

Username: admin

Password: admin123

📦 Build & Deployment (Server Lokal)
Ikuti langkah ini untuk meng-compile aplikasi menjadi satu kesatuan yang bisa diakses dari komputer lain di jaringan yang sama.

1. Build Frontend
# 1. Masuk ke direktori frontend
cd frontend

# 2. Jalankan perintah build
npm run build

Proses ini akan membuat folder baru bernama dist.

2. Gabungkan ke Backend
Salin folder dist dari frontend.

Tempelkan ke dalam folder backend/public/.

Ganti nama folder dist yang baru ditempel menjadi app.

3. Jalankan Server Utama
Anda hanya perlu menjalankan satu server dari sini.

Di Komputer Server:

Pastikan XAMPP (MySQL) sudah berjalan.

Buka terminal, masuk ke direktori backend.

Jalankan server dengan perintah:

node index.js

Server akan berjalan di http://localhost:5000.

Akses dari Komputer Lain (Klien):

Cari tahu alamat IP komputer server Anda (misal: 192.168.1.10) dengan mengetik ipconfig di CMD.

Pastikan komputer klien terhubung ke jaringan WiFi/LAN yang sama.

Buka browser di komputer klien dan akses http://[IP_SERVER]:5000 (contoh: http://192.168.1.10:5000).

Aplikasi Anda kini siap digunakan di seluruh jaringan lokal.