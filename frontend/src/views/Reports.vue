<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Laporan Bisnis</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Analisis performa penjualan dalam rentang waktu tertentu.</p>

    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 rounded-lg shadow flex flex-col sm:flex-row items-center gap-4">
      <div class="w-full">
        <label for="startDate" class="block text-sm font-medium">Tanggal Mulai</label>
        <input v-model="startDate" type="date" id="startDate" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
      </div>
      <div class="w-full">
        <label for="endDate" class="block text-sm font-medium">Tanggal Selesai</label>
        <input v-model="endDate" type="date" id="endDate" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
      </div>
      <button @click="fetchReport" class="w-full sm:w-auto mt-4 sm:mt-0 bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 h-10 self-end">
        Terapkan
      </button>
    </div>

    <div v-if="loading" class="text-center py-10">Memuat laporan...</div>
    <div v-else-if="reportData" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">TOTAL OMZET</h2>
        <p class="text-3xl font-bold mt-2 text-green-500">Rp {{ formatRupiah(reportData.totalOmzet) }}</p>
      </div>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">LABA KOTOR</h2>
        <p class="text-3xl font-bold mt-2 text-blue-500">Rp {{ formatRupiah(reportData.labaKotor) }}</p>
      </div>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">JUMLAH TRANSAKSI</h2>
        <p class="text-3xl font-bold mt-2">{{ reportData.totalTransactions }}</p>
      </div>
    </div>
    <div v-else class="text-center py-10">Silakan pilih rentang tanggal dan tekan Terapkan.</div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// State untuk menampung data
const startDate = ref('');
const endDate = ref('');
const reportData = ref(null);
const loading = ref(false);

// Helper function
const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
}

// Fungsi untuk mengambil data laporan dari API
const fetchReport = async () => {
  if (!startDate.value || !endDate.value) {
    alert('Harap pilih tanggal mulai dan tanggal selesai.');
    return;
  }
  loading.value = true;
  reportData.value = null;
  try {
    const response = await axios.get('/reports/sales', {
      params: {
        startDate: startDate.value,
        // Tambahkan T23:59:59 agar akhir hari ikut terhitung
        endDate: `${endDate.value}T23:59:59` 
      }
    });
    reportData.value = response.data;
  } catch (error) {
    alert('Gagal mengambil data laporan.');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Set tanggal default saat komponen dimuat
onMounted(() => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Format YYYY-MM-DD
  endDate.value = today.toISOString().split('T')[0];
  startDate.value = firstDayOfMonth.toISOString().split('T')[0];
});
</script>