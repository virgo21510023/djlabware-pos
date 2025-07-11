<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Riwayat Transaksi</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Lihat, kelola, dan proses retur untuk semua transaksi penjualan.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
        <div class="md:col-span-2">
          <label for="search" class="block text-sm font-medium mb-1">Cari Invoice / Nama</label>
          <input v-model="searchQuery" id="search" type="text" placeholder="Ketik untuk mencari..." class="w-full p-2 border rounded-md bg-background dark:bg-dark-background" />
        </div>
        <div>
          <label for="startDate" class="block text-sm font-medium mb-1">Tanggal Mulai</label>
          <input v-model="startDate" id="startDate" type="date" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium mb-1">Tanggal Selesai</label>
          <input v-model="endDate" id="endDate" type="date" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <button @click="clearFilters" class="w-full p-2 border rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Reset</button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">No. Invoice</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Pelanggan</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Total</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
            <tr v-else-if="transactions.length === 0"><td colspan="6" class="text-center py-4">Tidak ada riwayat transaksi.</td></tr>
            <tr v-for="trx in transactions" :key="trx.id">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{{ trx.invoice_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatTanggal(trx.transaction_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ trx.customer_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(trx.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ trx.status }}
                </span>
                <span v-if="trx.status === 'Belum Lunas'" class="block text-xs text-red-500">Sisa: Rp {{ formatRupiah(trx.remaining_amount) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">Rp {{ formatRupiah(trx.total_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <button v-if="trx.status !== 'Lunas'" @click="openSettleModal(trx)" class="font-semibold text-green-600 hover:text-green-500">Lunasi</button>
                <button @click="openDetailModal(trx.id)" class="text-blue-500 hover:text-blue-400">Detail</button>
                <button @click="reprintReceipt(trx.id)" class="text-primary hover:text-primary/80">Cetak</button>
                <button @click="openReturnModal(trx.id)" class="text-red-500 hover:text-red-400">Retur</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div v-if="isDetailModalOpen && selectedTransaction" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 class="text-xl font-bold mb-2">Detail Transaksi</h2>
        <p class="text-sm font-mono mb-4">{{ selectedTransaction.invoice_number }}</p>
        <div class="overflow-y-auto max-h-96">
          <table class="min-w-full">
            <thead><tr class="border-b"><th class="py-2 text-left">Produk</th><th class="py-2 text-right">Qty</th><th class="py-2 text-right">Harga</th><th class="py-2 text-right">Subtotal</th></tr></thead>
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
  
  <div v-if="isSettleModalOpen && transactionToSettle" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
        <input v-model.number="settleAmount" id="settleAmount" type="number" class="mt-1 w-full p-2 text-xl border rounded-md" />
      </div>
      <div class="mt-6 flex justify-end space-x-4">
        <button type="button" @click="isSettleModalOpen = false" class="px-4 py-2 border rounded-md">Batal</button>
        <button @click="handleSettlePayment" class="px-4 py-2 bg-primary text-white rounded-md">Konfirmasi Pelunasan</button>
      </div>
    </div>
  </div>

  <div v-if="isReturnModalOpen && transactionToReturn" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-xl shadow-xl">
      <h2 class="text-xl font-bold mb-2">Proses Retur Barang</h2>
      <p class="text-sm font-mono mb-4">{{ transactionToReturn.invoice_number }}</p>
      <form @submit.prevent="handleProcessReturn">
        <div class="max-h-80 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-surface dark:bg-dark-surface">
              <tr class="border-b"><th class="py-2 text-left">Produk</th><th class="py-2 text-right">Qty Beli</th><th class="py-2 text-right">Qty Diretur</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in returnItems" :key="item.product_id" class="border-b">
                <td>{{ item.product_name }}</td>
                <td class="text-right">{{ item.quantity_purchased }}</td>
                <td class="p-1"><input v-model.number="item.quantity_returned" type="number" min="0" :max="item.quantity_purchased" class="w-24 text-right p-1 border rounded-md"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <textarea v-model="returnNotes" placeholder="Catatan/alasan retur (opsional)" rows="2" class="w-full p-2 border rounded-md mt-4"></textarea>
        <div class="mt-6 flex justify-end space-x-4">
          <button @click="isReturnModalOpen = false" type="button" class="px-4 py-2 border rounded-md">Batal</button>
          <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-md">Proses Retur</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="transactionToPrint" class="print-area">
    <Struk :transaction="transactionToPrint" :storeInfo="storeInfo" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, nextTick } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { useToast } from "vue-toastification";
import Struk from '../components/Struk.vue';
import { debounce } from 'lodash-es';

const toast = useToast();
const transactions = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref('');
const transactionToPrint = ref(null);
const storeInfo = reactive({});

// State untuk Modal Detail
const isDetailModalOpen = ref(false);
const selectedTransaction = ref(null);

// State untuk Modal Pelunasan
const isSettleModalOpen = ref(false);
const transactionToSettle = ref(null);
const settleAmount = ref(0);

// State untuk Modal Retur
const isReturnModalOpen = ref(false);
const transactionToReturn = ref(null);
const returnItems = ref([]);
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
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (startDate.value && endDate.value) {
      params.append('startDate', startDate.value);
      params.append('endDate', endDate.value);
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
  searchQuery.value = '';
  startDate.value = '';
  endDate.value = '';
};

const debouncedFetch = debounce(fetchTransactions, 500);

watch([searchQuery, startDate, endDate], () => {
  if((startDate.value && !endDate.value) || (!startDate.value && endDate.value)) {
    return; // Jangan fetch jika salah satu tanggal kosong
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

const reprintReceipt = async (transactionId) => {
  const trxDetail = await fetchTransactionDetail(transactionId);
  if (trxDetail) {
    transactionToPrint.value = trxDetail;
    await nextTick();
    window.print();
    transactionToPrint.value = null;
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
  const trxDetail = await fetchTransactionDetail(transactionId);
  if (trxDetail) {
    transactionToReturn.value = trxDetail;
    returnItems.value = trxDetail.TransactionItems.map(item => ({
      product_id: item.product_id,
      product_name: item.Product.name,
      quantity_purchased: item.quantity,
      price_at_return: item.price_per_item,
      quantity_returned: 0
    }));
    returnNotes.value = '';
    isReturnModalOpen.value = true;
  }
};

const handleProcessReturn = async () => {
  const itemsToProcess = returnItems.value.filter(item => item.quantity_returned > 0);

  if (itemsToProcess.length === 0) {
    return toast.warning('Harap isi jumlah barang yang akan diretur.');
  }

  for (const item of itemsToProcess) {
    if (item.quantity_returned > item.quantity_purchased) {
      return toast.error(`Jumlah retur untuk ${item.product_name} melebihi jumlah pembelian.`);
    }
  }

  try {
    const payload = {
      transaction_id: transactionToReturn.value.id,
      notes: returnNotes.value,
      items_to_return: itemsToProcess.map(item => ({
        product_id: item.product_id,
        quantity_returned: item.quantity_returned,
        price_at_return: item.price_at_return,
      }))
    };
    await axios.post('/returns/sales', payload);
    toast.success('Retur berhasil diproses!');
    isReturnModalOpen.value = false;
    fetchTransactions();
  } catch (error) {
    toast.error('Gagal memproses retur.');
  }
};
</script>