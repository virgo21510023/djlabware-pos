<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Selamat Datang, {{ authStore.user?.name }}!</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Ringkasan aktivitas bisnis hari ini, {{ todayDate }}.</p>
    
    <div v-if="loading" class="text-center py-10">Memuat data...</div>
    <div v-else-if="summaryData" class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 dark:bg-green-800/50">
            <DollarSign class="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">PENJUALAN HARI INI</h2>
            <p class="text-2xl font-bold mt-1">Rp {{ formatRupiah(summaryData.totalOmzetToday) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
         <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-800/50">
            <ShoppingCart class="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">TRANSAKSI HARI INI</h2>
            <p class="text-2xl font-bold mt-1">{{ summaryData.totalTransactionsToday }}</p>
          </div>
        </div>
      </div>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 dark:bg-red-800/50">
            <ArchiveX class="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">STOK KRITIS (<= 5)</h2>
            <p class="text-2xl font-bold mt-1">{{ summaryData.criticalStockCount }} Produk</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="summaryData?.recentProducts.length > 0" class="mt-8">
        <h2 class="text-xl font-bold">Produk Baru Ditambahkan</h2>
        <div class="mt-4 bg-surface dark:bg-dark-surface rounded-lg shadow overflow-hidden">
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                <li v-for="product in summaryData.recentProducts" :key="product.id" class="p-4 flex justify-between items-center">
                    <div>
                        <p class="font-semibold">{{ product.name }}</p>
                        <p class="text-sm text-secondary">{{ product.kategori }} - {{ product.merk }}</p>
                    </div>
                    <span class="text-sm text-secondary">{{ formatTanggal(product.createdAt) }}</span>
                </li>
            </ul>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { DollarSign, ShoppingCart, ArchiveX } from 'lucide-vue-next';

const authStore = useAuthStore();
const summaryData = ref(null);
const loading = ref(false);

const todayDate = computed(() => format(new Date(), "eeee, d MMMM yyyy", { locale: id }));

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
}

const formatTanggal = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), "d MMM yyyy", { locale: id });
}

onMounted(async () => {
  loading.value = true;
  try {
    const response = await axios.get('/reports/dashboard-summary');
    summaryData.value = response.data;
  } catch (error) {
    console.error("Gagal mengambil ringkasan dashboard:", error);
  } finally {
    loading.value = false;
  }
});
</script>