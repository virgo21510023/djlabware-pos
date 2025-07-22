import pandas as pd
import numpy as np
import re # Import pustaka re untuk ekspresi reguler

# --- 1. Muat Data ---
# Ganti 'nama_file_anda.csv' dengan nama file CSV Anda
try:
    df = pd.read_csv('data_produk.csv')
    print("Data berhasil dimuat.")
except FileNotFoundError:
    print("Error: File CSV tidak ditemukan. Pastikan nama file dan lokasi sudah benar.")
    exit() # Keluar dari skrip jika file tidak ditemukan

# Tampilkan informasi awal DataFrame
print("\nInformasi awal DataFrame:")
print(df.info())
print("\nLima baris pertama DataFrame:")
print(df.head())

# --- 2. Bersihkan dan konversi 'Harga Beli (HPP)' ke numerik dan hitung Profit ---
# Pastikan kolom ada sebelum diproses
if 'Harga Beli (HPP)' in df.columns and 'Harga Jual' in df.columns:
    # Remove non-numeric characters from 'Harga Beli (HPP)' and convert to numeric
    # Menggunakan ekspresi reguler untuk menghapus karakter non-numerik kecuali titik desimal (jika ada)
    df['Harga Beli (HPP)'] = df['Harga Beli (HPP)'].astype(str).str.replace(r'[^0-9.]', '', regex=True)
    df['Harga Beli (HPP)'] = pd.to_numeric(df['Harga Beli (HPP)'], errors='coerce')

    # Convert 'Harga Jual' to numeric (assuming it's already clean or will be handled similarly if not)
    df['Harga Jual'] = df['Harga Jual'].astype(str).str.replace(r'[^0-9.]', '', regex=True)
    df['Harga Jual'] = pd.to_numeric(df['Harga Jual'], errors='coerce')

    # Calculate Profit
    df['Profit'] = df['Harga Jual'] - df['Harga Beli (HPP)']

    # Drop rows where Profit is NaN (due to non-numeric HPP/Harga Jual conversion)
    df.dropna(subset=['Profit'], inplace=True)
    print("\nPembersihan Harga Beli (HPP), Harga Jual, dan perhitungan Profit selesai.")
else:
    print("\nKolom 'Harga Beli (HPP)' atau 'Harga Jual' tidak ditemukan. Lewatkan perhitungan Profit.")


# --- 3. Standardisasi 'Satuan', 'Kategori', dan 'Merk' ---

def standardize_unit(row):
    nama_produk = str(row['Nama Produk']).lower()
    satuan_col = str(row['Satuan']).lower()

    # Prioritize existing 'Satuan' if it's a common unit
    common_units = ['kg', 'gram', 'ml', 'liter', 'pcs', 'roll', 'unit', 'meter', 'buah', 'lembar', 'box', 'set', 'pack']
    if satuan_col in common_units:
        return satuan_col.capitalize() # Kembalikan dengan huruf pertama kapital

    # Try to extract from Nama Produk if Satuan is missing or not common
    for unit in common_units:
        if f' {unit}' in nama_produk or f'{unit} ' in nama_produk or f'-{unit}' in nama_produk:
            return unit.capitalize()

    # Default if no unit found
    return 'Tidak Diketahui'

def standardize_category(row):
    nama_produk = str(row['Nama Produk']).lower()
    kategori_col = str(row['Kategori']).lower()

    # Prioritize existing 'Kategori' if it's not empty
    if kategori_col and kategori_col != 'nan': # Cek juga 'nan' string
        # Standardisasi beberapa kategori umum
        if 'teknis' in kategori_col or 'padatan teknis' in kategori_col:
            return 'Teknis'
        # Tambahkan standardisasi kategori lain di sini jika perlu
        return kategori_col.capitalize()

    # Try to extract from Nama Produk if Kategori is missing
    if 'teknis' in nama_produk or 'teknis' in kategori_col:
        return 'Teknis'
    if 'food grade' in nama_produk or 'makanan' in nama_produk:
        return 'Makanan'
    if 'pro analis' in nama_produk or 'analisis' in nama_produk:
        return 'Analisis'
    if 'powder' in nama_produk or 'bubuk' in nama_produk:
        return 'Bubuk'
    if 'cair' in nama_produk:
        return 'Cair'
    if 'parfum' in nama_produk:
        return 'Parfum'
    if 'apar' in nama_produk:
        return 'APAR'
    if 'kimia' in nama_produk:
        return 'Kimia'
    if 'alat' in nama_produk or 'instrument' in nama_produk or 'spectro' in nama_produk or 'incubator' in nama_produk:
        return 'Alat/Instrument'


    # Default if no category found
    return 'Tidak Diketahui'

def standardize_merk(row):
    nama_produk = str(row['Nama Produk']).lower()
    merk_col = str(row['Merk']).lower()

    # Prioritize existing 'Merk' if it