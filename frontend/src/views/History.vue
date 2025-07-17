<template>
  <div>
    <h1 class="text-3xl font-bold">Riwayat Transaksi</h1>
    <p class="mt-2 text-secondary">Lihat, kelola, dan proses retur untuk semua transaksi penjualan.</p>

    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
        <div class="md:col-span-2">
          <label for="search" class="block text-sm font-medium mb-1">Cari Invoice / Nama</label>
          <input v-model="filters.search" id="search" type="text" placeholder="Ketik untuk mencari..."
            class="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label for="startDate" class="block text-sm font-medium mb-1">Tanggal Mulai</label>
          <input v-model="filters.startDate" id="startDate" type="date" class="w-full p-2 border rounded-md">
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium mb-1">Tanggal Selesai</label>
          <input v-model="filters.endDate" id="endDate" type="date" class="w-full p-2 border rounded-md">
        </div>
        <button @click="clearFilters"
          class="w-full p-2 border rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Reset</button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left">No. Invoice</th>
              <th class="px-6 py-3 text-left">Tanggal</th>
              <th class="px-6 py-3 text-left">Pelanggan</th>
              <th class="px-6 py-3 text-left">Metode Bayar</th>
              <th class="px-6 py-3 text-left">Status</th>
              <th class="px-6 py-3 text-right">Total</th>
              <th class="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4">Memuat data...</td>
            </tr>
            <tr v-else-if="transactions.length === 0">
              <td colspan="7" class="text-center py-4">Tidak ada riwayat transaksi.</td>
            </tr>
            <tr v-for="trx in transactions" :key="trx.id">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{{ trx.invoice_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatTanggal(trx.transaction_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ trx.customer_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getPaymentMethodClass(trx.payment_method)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ trx.payment_method }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(trx.status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ trx.status }}
                </span>
                <span v-if="trx.status === 'Belum Lunas'" class="block text-xs text-red-500">Sisa: Rp {{
                  formatRupiah(trx.remaining_amount) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">Rp {{ formatRupiah(trx.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <button v-if="trx.status === 'Belum Lunas'" @click="openSettleModal(trx)"
                  class="font-semibold text-green-600 hover:text-green-500">Lunasi</button>
                <button @click="openDetailModal(trx.id)" class="text-blue-500 hover:text-blue-400">Detail</button>
                <button @click="reprintReceipt(trx.id)" class="text-primary hover:text-primary/80">Cetak</button>
                <button v-if="trx.status !== 'Diretur Penuh'" @click="openReturnModal(trx.id)"
                  class="font-semibold text-red-500 hover:text-red-400">Retur</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isDetailModalOpen && selectedTransaction"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 class="text-xl font-bold mb-2">Detail Transaksi</h2>
        <p class="text-sm font-mono mb-4">{{ selectedTransaction.invoice_number }}</p>
        <div class="overflow-y-auto max-h-96">
          <table class="min-w-full">
            <thead>
              <tr class="border-b">
                <th class="py-2 text-left">Produk</th>
                <th class="py-2 text-right">Qty</th>
                <th class="py-2 text-right">Harga</th>
                <th class="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedTransaction.TransactionItems" :key="item.id" class="border-b">
                <td class="py-2">{{ item.Product.name }}</td>
                <td class="py-2 text-right">{{ item.quantity }} {{ item.Product.satuan }}</td>
                <td class="py-2 text-right">Rp {{ formatRupiah(item.price_per_item) }}</td>
                <td class="py-2 text-right">Rp {{ formatRupiah(item.price_per_item * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 flex justify-end">
          <button @click="isDetailModalOpen = false" class="px-4 py-2 rounded-md border">Tutup</button>
        </div>
      </div>
    </div>

    <div v-if="isSettleModalOpen && transactionToSettle"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Pelunasan Tagihan</h2>
        <p class="text-sm font-mono mb-4">{{ transactionToSettle.invoice_number }}</p>
        <div class="my-4 p-3 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
          <div class="flex justify-between font-bold text-yellow-800 dark:text-yellow-200">
            <span>Sisa Tagihan:</span>
            <span>Rp {{ formatRupiah(transactionToSettle.remaining_amount) }}</span>
          </div>
        </div>
        <div>
          <label for="settleAmount" class="block text-sm font-medium">Jumlah Bayar Pelunasan</label>
          <input v-model.number="settleAmount" id="settleAmount" type="number"
            class="mt-1 w-full p-2 text-xl border rounded-md" />
        </div>
        <div class="mt-6 flex justify-end space-x-4">
          <button type="button" @click="isSettleModalOpen = false" class="px-4 py-2 border rounded-md">Batal</button>
          <button @click="handleSettlePayment" class="px-4 py-2 bg-primary text-white rounded-md">Konfirmasi
            Pelunasan</button>
        </div>
      </div>
    </div>

    <div v-if="isReturnModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-xl shadow-xl">
        <h2 class="text-xl font-bold mb-2">Proses Retur Barang</h2>
        <p class="text-sm font-mono mb-4">{{ transactionToReturn?.invoice_number }}</p>
        <form @submit.prevent="handleProcessReturn">
          <div v-if="returnItemsLoading" class="text-center p-8">Memuat item...</div>
          <div v-else class="max-h-80 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-surface dark:bg-dark-surface">
                <tr class="border-b">
                  <th class="py-2 text-left">Produk</th>
                  <th class="py-2 text-center">Dibeli</th>
                  <th class="py-2 text-center">Sudah Diretur</th>
                  <th class="w-32 py-2 text-center">Qty Retur</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in returnableItems" :key="item.product_id" class="border-b">
                  <td>{{ item.Product.name }}</td>
                  <td class="text-center">{{ item.quantity_purchased }}</td>
                  <td class="text-center">{{ item.quantity_already_returned }}</td>
                  <td class="p-1"><input v-model.number="item.quantity_to_return" type="number" min="0"
                      :max="item.max_returnable" class="w-full text-center p-1 border rounded-md"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <textarea v-model="returnNotes" placeholder="Catatan/alasan retur (opsional)" rows="2"
            class="w-full p-2 border rounded-md mt-4"></textarea>
          <div class="mt-6 flex justify-end space-x-4">
            <button @click="isReturnModalOpen = false" type="button" class="px-4 py-2 border rounded-md">Batal</button>
            <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-md">Proses Retur</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="transactionToPrint" class="print-area"
      :class="{ 'thermal-print-format': storeInfo.receipt_format === 'thermal_58mm' }">
      <component :is="receiptComponent" :transaction="transactionToPrint" :storeInfo="storeInfo" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, nextTick, computed, shallowRef } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { useToast } from "vue-toastification";
import Struk from '../components/Struk.vue';
import StrukA5 from '../components/StrukA5.vue'; import { debounce } from 'lodash-es';

const toast = useToast();
const transactions = ref([]);
const loading = ref(false);
const filters = reactive({
  search: '',
  startDate: '',
  endDate: ''
});
const storeInfo = reactive({
  receipt_format: 'thermal_58mm' // Nilai default
});
const transactionToPrint = ref(null);

// State untuk Modal Detail
const isDetailModalOpen = ref(false);
const selectedTransaction = ref(null);

const getPaymentMethodClass = (method) => {
  const m = method?.toLowerCase();
  if (m === 'tunai') return 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300';
  if (m === 'qris') return 'bg-purple-100 text-purple-800 dark:bg-purple-800/50 dark:text-purple-300';
  if (m === 'transfer') return 'bg-orange-100 text-orange-800 dark:bg-orange-800/50 dark:text-orange-300';
  if (m === 'dp') return 'bg-teal-100 text-teal-800 dark:bg-teal-800/50 dark:text-teal-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// State untuk Modal Pelunasan
const isSettleModalOpen = ref(false);
const transactionToSettle = ref(null);
const settleAmount = ref(0);

// State untuk Modal Retur
const isReturnModalOpen = ref(false);
const transactionToReturn = ref(null);
const returnableItems = ref([]);
const returnItemsLoading = ref(false);
const returnNotes = ref('');

const formatRupiah = (number) => Number(number ? number : 0).toLocaleString('id-ID');

const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: id });
};

const getStatusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === 'lunas') return 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-300';
  if (s === 'belum lunas') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-300';
  if (s === 'diretur sebagian' || s === 'diretur penuh') return 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate && filters.endDate) {
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
    }
    const response = await axios.get('/transactions', { params });
    transactions.value = response.data;
  } catch (error) {
    toast.error('Gagal mengambil riwayat transaksi.');
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.search = '';
  filters.startDate = '';
  filters.endDate = '';
  // fetchTransactions akan otomatis terpicu oleh 'watch'
};

const debouncedFetch = debounce(fetchTransactions, 500);

watch(filters, () => {
  if ((filters.startDate && !filters.endDate) || (!filters.startDate && filters.endDate)) {
    return;
  }
  debouncedFetch();
}, { deep: true });

const fetchStoreInfo = async () => {
  try {
    const response = await axios.get('/settings');
    Object.assign(storeInfo, response.data);
  } catch (error) {
    console.error("Gagal memuat info toko untuk struk");
  }
};

onMounted(() => {
  fetchTransactions();
  fetchStoreInfo();
});

const fetchTransactionDetail = async (transactionId) => {
  try {
    const response = await axios.get(`/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    toast.error('Gagal mengambil detail transaksi.');
    return null;
  }
};

const openDetailModal = async (transactionId) => {
  const trxDetail = await fetchTransactionDetail(transactionId);
  if (trxDetail) {
    selectedTransaction.value = trxDetail;
    isDetailModalOpen.value = true;
  }
};

const openSettleModal = (transaction) => {
  transactionToSettle.value = transaction;
  settleAmount.value = transaction.remaining_amount;
  isSettleModalOpen.value = true;
};

const handleSettlePayment = async () => {
  try {
    await axios.put(`/transactions/${transactionToSettle.value.id}/settle`, {
      amount_paid: settleAmount.value
    });
    toast.success('Transaksi berhasil dilunasi!');
    isSettleModalOpen.value = false;
    fetchTransactions();
  } catch (error) {
    toast.error('Gagal melunasi transaksi.');
  }
};

const openReturnModal = async (transactionId) => {
  isReturnModalOpen.value = true;
  returnItemsLoading.value = true;
  try {
    const response = await axios.get(`/transactions/${transactionId}/returnable-items`);
    const trxDetail = await fetchTransactionDetail(transactionId);
    transactionToReturn.value = trxDetail;
    returnableItems.value = response.data.map(item => ({
      ...item,
      quantity_to_return: 0
    }));
  } catch (error) {
    toast.error('Gagal memuat data untuk retur.');
    isReturnModalOpen.value = false;
  } finally {
    returnItemsLoading.value = false;
  }
};

const handleProcessReturn = async () => {
  const itemsToProcess = returnableItems.value
    .filter(item => item.quantity_to_return > 0)
    .map(item => ({
      product_id: item.product_id,
      quantity_returned: item.quantity_to_return,
      price_at_return: item.price_per_item
    }));

  if (itemsToProcess.length === 0) {
    return toast.warning('Harap isi jumlah barang yang akan diretur.');
  }

  for (const item of returnableItems.value) {
    if (item.quantity_to_return > item.max_returnable) {
      return toast.error(`Jumlah retur untuk ${item.Product.name} melebihi jumlah yang bisa diretur.`);
    }
  }

  try {
    const payload = {
      transaction_id: transactionToReturn.value.id,
      notes: returnNotes.value,
      items_to_return: itemsToProcess
    };
    await axios.post('/returns/sales', payload);
    toast.success('Retur berhasil diproses!');
    isReturnModalOpen.value = false;
    fetchTransactions();
  } catch (error) {
    toast.error('Gagal memproses retur.');
  }
};

// Computed property untuk memilih komponen struk secara dinamis
const receiptComponent = computed(() => {
  return storeInfo.receipt_format === 'a5_landscape' ? StrukA5 : Struk;
});

const reprintReceipt = async (transactionId) => {
  const trxDetail = await fetchTransactionDetail(transactionId);
  if (trxDetail) {
    transactionToPrint.value = trxDetail;
    await nextTick();
    window.print();
    transactionToPrint.value = null;
  }
};
</script>