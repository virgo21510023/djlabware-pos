<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Riwayat Pembelian</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Lihat semua data pembelian barang dari supplier.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
        <input v-model="filters.search" type="text" placeholder="Cari No. Nota / Supplier..." class="md:col-span-2 w-full p-2 border rounded-md" />
        <input v-model="filters.startDate" type="date" class="w-full p-2 border rounded-md">
        <input v-model="filters.endDate" type="date" class="w-full p-2 border rounded-md">
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="w-12"></th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">No. Nota</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Supplier</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="5" class="text-center py-4">Memuat data...</td></tr>
            <tr v-else-if="purchases.length === 0"><td colspan="5" class="text-center py-4">Tidak ada riwayat pembelian.</td></tr>
            
            <template v-for="purchase in purchases" :key="purchase.id">
              <tr @click="toggleDetails(purchase)" class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-4 text-center">
                  <ChevronRight class="w-5 h-5 transition-transform" :class="{ 'rotate-90': expandedId === purchase.id }" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ formatTanggal(purchase.purchase_date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-mono">{{ purchase.invoice_number }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium">{{ purchase.supplier_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">Rp {{ formatRupiah(purchase.total_amount) }}</td>
              </tr>
              
              <tr v-if="expandedId === purchase.id">
                <td colspan="5" class="p-4 bg-gray-50 dark:bg-gray-800">
                  <div v-if="purchase.detailLoading" class="text-center">Memuat detail...</div>
                  <div v-else-if="purchase.PurchaseItems">
                    <h4 class="font-bold mb-2">Detail Item:</h4>
                    <ul class="list-disc list-inside space-y-1">
                      <li v-for="item in purchase.PurchaseItems" :key="item.id">
                        {{ item.Product.name }} - <strong>{{ item.quantity }} {{ item.Product.satuan }}</strong> @ Rp {{ formatRupiah(item.purchase_price) }}
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { debounce } from 'lodash-es';
import { ChevronRight } from 'lucide-vue-next';

const purchases = ref([]);
const loading = ref(false);
const expandedId = ref(null); // Menyimpan ID baris yang sedang dibuka detailnya

const filters = reactive({
  search: '',
  startDate: '',
  endDate: ''
});

const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');
const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMMM yyyy", { locale: id });
};

const fetchPurchases = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate && filters.endDate) {
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
    }
    const response = await axios.get('/purchases', { params });
    purchases.value = response.data.map(p => ({ ...p, detailLoading: false }));
  } catch (error) {
    alert('Gagal mengambil riwayat pembelian.');
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(fetchPurchases, 500);
watch(filters, () => {
  debouncedFetch();
});

onMounted(fetchPurchases);

const toggleDetails = async (purchase) => {
  if (expandedId.value === purchase.id) {
    expandedId.value = null;
  } else {
    // Cari index dari 'purchase' di dalam array 'purchases'
    const index = purchases.value.findIndex(p => p.id === purchase.id);
    if (index === -1) return;

    expandedId.value = purchase.id;
    
    if (!purchases.value[index].PurchaseItems) {
      purchases.value[index].detailLoading = true;
      try {
        const response = await axios.get(`/purchases/${purchase.id}`);
        // Update purchase di dalam array dengan data lengkap
        purchases.value[index] = { ...response.data, detailLoading: false };
      } catch (error) {
        alert('Gagal mengambil detail item.');
        // Tetap matikan loading meskipun error
        purchases.value[index].detailLoading = false;
      }
    }
  }
};
</script>