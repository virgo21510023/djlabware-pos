<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold">Daftar Purchase Order</h1>
        <p class="mt-2 text-secondary">Lacak semua pesanan barang ke supplier.</p>
      </div>
      <router-link to="/purchase-orders/create" class="bg-primary text-white font-bold py-2 px-4 rounded-md flex items-center">
        <Plus class="w-5 h-5 mr-2" />
        Buat PO Baru
      </router-link>
    </div>

    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left">No. PO</th>
              <th class="px-6 py-3 text-left">Tanggal Pesan</th>
              <th class="px-6 py-3 text-left">Supplier</th>
              <th class="px-6 py-3 text-right">Total Nominal</th>
              <th class="px-6 py-3 text-center">Status</th>
              <th class="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
            <tr v-for="po in purchaseOrders" :key="po.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 font-mono">{{ po.po_number }}</td>
              <td class="px-6 py-4">{{ formatTanggal(po.order_date) }}</td>
              <td class="px-6 py-4 font-medium">{{ po.supplier_name }}</td>
              <td class="px-6 py-4 text-right font-semibold">{{ formatRupiah(po.grand_total) }}</td>
              <td class="px-6 py-4 text-center">
                <span :class="getStatusClass(po.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ po.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                  <button @click="goToPoDetail(po.id)" title="Lihat & Cetak PDF" class="p-2 text-blue-500 hover:bg-blue-100 rounded-full">
                    <FileText class="w-4 h-4"/>
                  </button>
                  <button v-if="po.status === 'Dipesan'" @click="receiveGoods(po)" title="Terima Barang & Buat Pembelian" class="p-2 text-green-600 hover:bg-green-100 rounded-full">
                    <Truck class="w-4 h-4"/>
                  </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { Plus, FileText, Truck } from 'lucide-vue-next';
import { usePurchaseProcessStore } from '../stores/purchaseProcessStore';

const router = useRouter();
const purchaseProcessStore = usePurchaseProcessStore();
const purchaseOrders = ref([]);
const loading = ref(false);

const formatRupiah = (number) => {
  return "Rp " + Number(number || 0).toLocaleString('id-ID');
};

const formatTanggal = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d MMM yyyy", { locale: id });
};

const getStatusClass = (status) => {
  if (status === 'Selesai') return 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-300';
  if (status === 'Dibatalkan') return 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-300';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300'; // Dipesan
};

onMounted(async () => {
  loading.value = true;
  try {
    const response = await axios.get('/purchase-orders');
    purchaseOrders.value = response.data;
  } catch (error) {
    alert('Gagal mengambil daftar PO.');
  } finally {
    loading.value = false;
  }
});

const receiveGoods = async (po) => {
    // Ambil detail PO lengkap sebelum dikirim ke form pembelian
    try {
        const response = await axios.get(`/purchase-orders/${po.id}`);
        purchaseProcessStore.setPoForPurchase(response.data);
        router.push('/purchasing');
    } catch (error) {
        alert('Gagal mengambil detail PO untuk membuat pembelian.');
    }
};

const goToPoDetail = (poId) => {
  router.push(`/purchase-orders/${poId}`);
};
</script>