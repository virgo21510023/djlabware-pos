<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Laporan Bisnis</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Analisis performa penjualan setelah dikurangi retur.</p>

    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
          <label for="startDate" class="block text-sm font-medium mb-1">Tanggal Mulai</label>
          <input v-model="startDate" type="date" id="startDate" name="startDate" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium mb-1">Tanggal Selesai</label>
          <input v-model="endDate" type="date" id="endDate" name="endDate" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <button @click="fetchReport" class="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 h-10">
          Terapkan Filter
        </button>
        <button @click="downloadCSV" :disabled="!reportData" class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 h-10 disabled:opacity-50">
          Unduh CSV
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10"><p>Memuat laporan...</p></div>
    <div v-else-if="reportData" class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
          <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">OMZET BERSIH</h2>
          <p class="text-3xl font-bold mt-2 text-green-500">Rp {{ formatRupiah(reportData.totalOmzet) }}</p>
        </div>
        <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
          <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">LABA KOTOR BERSIH</h2>
          <p class="text-3xl font-bold mt-2 text-blue-500">Rp {{ formatRupiah(reportData.labaKotor) }}</p>
        </div>
        <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
          <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">JUMLAH TRANSAKSI</h2>
          <p class="text-3xl font-bold mt-2">{{ reportData.totalTransactions }}</p>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-lg font-bold mb-4">Rincian Retur</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-red-50 dark:bg-red-900/50 p-6 rounded-lg shadow">
            <h2 class="text-sm font-medium text-red-800 dark:text-red-200">TOTAL NILAI RETUR</h2>
            <p class="text-2xl font-bold mt-2 text-red-600 dark:text-red-300">- Rp {{ formatRupiah(reportData.totalRefund) }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-10"><p>Gagal memuat data atau tidak ada data pada rentang tanggal ini.</p></div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from "vue-toastification";

const toast = useToast();
const startDate = ref('');
const endDate = ref('');
const reportData = ref(null);
const loading = ref(false);

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
};

const downloadCSV = () => {
  if (!reportData.value) return;

  const { totalOmzet, labaKotor, totalTransactions, totalRefund } = reportData.value;
  let csvContent = "data:text/csv;charset=utf-8,";
  
  csvContent += "Metrik,Jumlah\r\n";
  csvContent += `Omzet Bersih,${totalOmzet}\r\n`;
  csvContent += `Laba Kotor Bersih,${labaKotor}\r\n`;
  csvContent += `Total Transaksi,${totalTransactions}\r\n`;
  csvContent += `Total Nilai Retur,${totalRefund}\r\n`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `laporan_penjualan_${startDate.value}_sd_${endDate.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const fetchReport = async () => {
  if (!startDate.value || !endDate.value) {
    return toast.warning('Harap pilih tanggal mulai dan tanggal selesai.');
  }
  loading.value = true;
  reportData.value = null; 
  try {
    const response = await axios.get('/reports/sales', {
      params: { startDate: startDate.value, endDate: endDate.value }
    });
    reportData.value = response.data;
  } catch (error) {
    toast.error('Gagal mengambil data laporan.');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const today = new Date().toISOString().split('T')[0];
  startDate.value = today;
  endDate.value = today;
  fetchReport();
});
</script>