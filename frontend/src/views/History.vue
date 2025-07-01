<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Riwayat Transaksi</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Lihat semua transaksi penjualan yang telah selesai.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Cari No. Invoice..." 
          class="w-full sm:w-72 p-2 border rounded-md bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">No. Invoice</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Kasir</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
              <th class="relative px-6 py-3"><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredTransactions.length === 0">
              <td colspan="5" class="text-center py-4">Tidak ada riwayat transaksi.</td>
            </tr>
            <tr v-for="trx in filteredTransactions" :key="trx.id">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{{ trx.invoice_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatTanggal(trx.transaction_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ trx.User ? trx.User.name : 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-semibold">Rp {{ formatRupiah(trx.total_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary hover:text-primary/80">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

const transactions = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
}

const formatTanggal = (dateString) => {
  // JIKA TANGGAL KOSONG ATAU NULL, KEMBALIKAN 'N/A'
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    // Cek lagi jika hasil parsing tidak valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return format(date, "d MMMM yyyy, HH:mm", { locale: id });
  } catch (error) {
    return 'Invalid Date';
  }
}

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/transactions');
    transactions.value = response.data;
  } catch (error) {
    alert('Gagal mengambil riwayat transaksi.');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTransactions);

const filteredTransactions = computed(() => {
  if (!searchQuery.value) {
    return transactions.value;
  }
  return transactions.value.filter(trx =>
    trx.invoice_number.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>