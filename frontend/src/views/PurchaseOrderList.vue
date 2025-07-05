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
              <th class="w-12"></th>
              <th class="px-6 py-3 text-left">No. PO</th>
              <th class="px-6 py-3 text-left">Tanggal Pesan</th>
              <th class="px-6 py-3 text-left">Supplier</th>
              <th class="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="5" class="text-center py-4">Memuat data...</td></tr>
            <template v-for="po in purchaseOrders" :key="po.id">
              <tr @click="toggleDetails(po)" class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-4 text-center"><ChevronRight class="w-5 h-5 transition-transform" :class="{ 'rotate-90': expandedId === po.id }" /></td>
                <td class="px-6 py-4 font-mono">{{ po.po_number }}</td>
                <td class="px-6 py-4">{{ formatTanggal(po.order_date) }}</td>
                <td class="px-6 py-4 font-medium">{{ po.supplier_name }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="getStatusClass(po.status)" class="px-2 py-1 text-xs font-semibold rounded-full">{{ po.status }}</span>
                </td>
              </tr>
              <tr v-if="expandedId === po.id">
                <td colspan="5" class="p-4 bg-gray-50 dark:bg-gray-800">
                  <div v-if="po.detailLoading" class="text-center">Memuat detail...</div>
                  <div v-else-if="po.items && po.items.length > 0">
                    <h4 class="font-bold mb-2">Aksi untuk PO: {{ po.po_number }}</h4>
                    <div class="flex items-center gap-4">
                      <button v-if="po.status === 'Dipesan'" @click="receiveGoods(po)" class="bg-green-600 text-white font-semibold py-2 px-4 rounded-md">
                        Terima Barang
                      </button>
                      <button @click="goToPoDetail(po.id)" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
                        Lihat & Cetak PDF
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { Plus, ChevronRight } from 'lucide-vue-next';
import { usePurchaseProcessStore } from '../stores/purchaseProcessStore';

const router = useRouter();
const purchaseProcessStore = usePurchaseProcessStore();
const purchaseOrders = ref([]);
const loading = ref(false);
const expandedId = ref(null);

const formatTanggal = (dateString) => format(new Date(dateString), "d MMM yyyy", { locale: id });

const getStatusClass = (status) => {
  if (status === 'Selesai') return 'bg-green-100 text-green-800';
  if (status === 'Dibatalkan') return 'bg-red-100 text-red-800';
  return 'bg-blue-100 text-blue-800'; // Dipesan
};

onMounted(async () => {
  loading.value = true;
  try {
    const response = await axios.get('/purchase-orders');
    purchaseOrders.value = response.data.map(po => ({ ...po, detailLoading: false }));
  } catch (error) {
    alert('Gagal mengambil daftar PO.');
  } finally {
    loading.value = false;
  }
});

const toggleDetails = async (po) => {
  if (expandedId.value === po.id) {
    expandedId.value = null;
  } else {
    expandedId.value = po.id;
    const index = purchaseOrders.value.findIndex(p => p.id === po.id);
    if (index !== -1 && !purchaseOrders.value[index].items) {
      purchaseOrders.value[index].detailLoading = true;
      try {
        const response = await axios.get(`/purchase-orders/${po.id}`);
        purchaseOrders.value[index] = { ...response.data, detailLoading: false };
      } catch (error) {
        purchaseOrders.value[index].detailLoading = false;
      }
    }
  }
};

const receiveGoods = (po) => {
  purchaseProcessStore.setPoForPurchase(po);
  router.push('/purchasing');
};

// FUNGSI BARU UNTUK NAVIGASI
const goToPoDetail = (poId) => {
  router.push(`/purchase-orders/${poId}`);
};
</script>