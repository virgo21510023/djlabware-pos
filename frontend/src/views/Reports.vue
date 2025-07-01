<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Laporan Bisnis</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Analisis performa penjualan dalam rentang waktu tertentu.</p>

    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 rounded-lg shadow flex flex-col sm:flex-row items-center gap-4">
      <div class="w-full">
        <label for="startDate" class="block text-sm font-medium mb-1">Tanggal Mulai</label>
        <input v-model="startDate" type="date" id="startDate" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
      </div>
      <div class="w-full">
        <label for="endDate" class="block text-sm font-medium mb-1">Tanggal Selesai</label>
        <input v-model="endDate" type="date" id="endDate" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
      </div>
      <button @click="fetchReport" class="w-full sm:w-auto mt-4 sm:mt-0 bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 h-10 self-end">
        Terapkan
      </button>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p>Memuat laporan...</p>
    </div>
    <div v-else-if="reportData" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">TOTAL OMZET (PENJUALAN)</h2>
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
    <div v-else class="text-center py-10">
      <p>Gagal memuat data atau tidak ada data pada rentang tanggal ini.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const startDate = ref('');
const endDate = ref('');
const reportData = ref(null);
const loading = ref(false);

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
};

const fetchReport = async () => {
  if (!startDate.value || !endDate.value) {
    alert('Harap pilih tanggal mulai dan tanggal selesai.');
    return;
  }
  loading.value = true;
  reportData.value = null; // Reset data sebelum fetch baru
  try {
    const response = await axios.get('/reports/sales', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value
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

// Set tanggal default dan langsung fetch data saat komponen dimuat
onMounted(() => {
  const today = new Date().toISOString().split('T')[0];
  startDate.value = today;
  endDate.value = today;
  fetchReport(); // Otomatis muat data untuk hari ini
});
</script>