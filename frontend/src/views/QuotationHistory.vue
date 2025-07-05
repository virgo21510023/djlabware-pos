<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Riwayat Penawaran</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Lacak semua penawaran yang pernah dibuat dan statusnya.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
        <input v-model="filters.search" type="text" placeholder="Cari No. Penawaran / Pelanggan..." class="md:col-span-2 w-full p-2 border rounded-md" />
        <input v-model="filters.startDate" type="date" class="w-full p-2 border rounded-md">
        <input v-model="filters.endDate" type="date" class="w-full p-2 border rounded-md">
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="w-12"></th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">No. Penawaran</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Pelanggan</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
            <tr v-else-if="quotations.length === 0"><td colspan="6" class="text-center py-4">Tidak ada riwayat penawaran.</td></tr>
            
            <template v-for="quote in quotations" :key="quote.id">
              <tr @click="toggleDetails(quote)" class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-4 text-center">
                  <ChevronRight class="w-5 h-5 transition-transform" :class="{ 'rotate-90': expandedId === quote.id }" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-mono">{{ quote.quotation_number }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ formatTanggal(quote.quotation_date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium">{{ quote.customer_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="getStatusClass(quote.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ quote.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">Rp {{ formatRupiah(quote.grand_total) }}</td>
              </tr>
              
              <tr v-if="expandedId === quote.id">
                <td colspan="6" class="p-4 bg-gray-50 dark:bg-gray-800">
                  <div v-if="quote.detailLoading" class="text-center">Memuat detail...</div>
                  <div v-else-if="quote.items && quote.items.length > 0">
                    <h4 class="font-bold mb-2">Detail Item:</h4>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                      <li v-for="item in quote.items" :key="item.id">
                        {{ item.product_name }} - <strong>{{ item.quantity }} {{ item.Product?.satuan || '' }}</strong> @ Rp {{ formatRupiah(item.price) }}
                        <span v-if="item.stock_status === 'PO'" class="ml-2 text-xs bg-red-200 text-red-800 px-1 rounded">PO</span>
                      </li>
                    </ul>
                    <div class="mt-4">
                      <button @click="createInvoice(quote.id)" class="bg-green-600 text-white font-bold py-2 px-4 rounded-md">
                        Buat Invoice
                      </button>
                    </div>
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
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const quotations = ref([]);
const loading = ref(false);
const expandedId = ref(null);

const filters = reactive({
  search: '',
  startDate: '',
  endDate: ''
});

const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');
const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMM yyyy", { locale: id });
};

const getStatusClass = (status) => {
  const S = status?.toLowerCase();
  if (S === 'disetujui' || S === 'selesai (invoiced)') return 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-300';
  if (S === 'ditolak') return 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-300';
  if (S === 'terkirim') return 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const fetchQuotations = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate && filters.endDate) {
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
    }
    const response = await axios.get('/quotations', { params });
    quotations.value = response.data.map(q => ({ ...q, detailLoading: false }));
  } catch (error) {
    toast.error('Gagal mengambil riwayat penawaran.');
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(fetchQuotations, 500);
watch(filters, () => debouncedFetch());

onMounted(fetchQuotations);

const toggleDetails = async (quote) => {
  if (expandedId.value === quote.id) {
    expandedId.value = null;
  } else {
    const index = quotations.value.findIndex(q => q.id === quote.id);
    if (index === -1) return;
    
    expandedId.value = quote.id;
    
    if (!quotations.value[index].items) {
      quotations.value[index].detailLoading = true;
      try {
        const response = await axios.get(`/quotations/${quote.id}`);
        quotations.value[index] = { ...response.data, detailLoading: false };
      } catch (error) {
        toast.error('Gagal mengambil detail item.');
        quotations.value[index].detailLoading = false;
      }
    }
  }
};

const createInvoice = async (quotationId) => {
  if (confirm('Apakah Anda yakin ingin membuat Invoice dari penawaran ini? Aksi ini akan memotong stok.')) {
    try {
      const response = await axios.post('/invoices/from-quotation', { quotationId });
      toast.success(`Invoice ${response.data.invoice_number} berhasil dibuat!`);
      router.push('/invoices');
    } catch (error) {
      toast.error(`Gagal membuat invoice: ${error.response?.data?.message || 'Error tidak diketahui'}`);
    }
  }
};
</script>