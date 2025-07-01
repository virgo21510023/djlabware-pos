<template>
  <div class="flex flex-col h-[calc(100vh-8.5rem)]">
    
    <div class="flex-shrink-0">
      <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Manajemen Inventaris</h1>
      <p class="mt-2 text-secondary dark:text-dark-secondary">Tambah, lihat, dan perbarui data produk Anda.</p>
    </div>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow flex flex-col flex-grow">
      <div class="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Cari produk..." 
          class="w-full sm:w-72 p-2 border rounded-md bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="openStockInModal" class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center">
            <LogIn class="w-5 h-5 mr-2" />
            Stok Masuk
          </button>
          <button @click="openProductModal()" class="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 flex items-center justify-center">
            <Plus class="w-5 h-5 mr-2" />
            Tambah Produk
          </button>
        </div>
      </div>

      <div class="overflow-x-auto flex-grow overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Nama Produk</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Kategori</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Merk</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Stok</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Harga Jual</th>
              <th class="relative px-6 py-3"><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredProducts.length === 0">
              <td colspan="6" class="text-center py-4">Tidak ada data produk.</td>
            </tr>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ product.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.kategori }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.merk }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }} {{ product.satuan }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-semibold">Rp {{ formatRupiah(product.sell_price) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openProductModal(product)" class="text-primary hover:text-primary/80">Edit</button>
                <button @click="handleDeleteProduct(product.id, product.name)" class="text-red-500 hover:text-red-400 ml-4">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex-shrink-0 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 border rounded-md disabled:opacity-50">
          Sebelumnya
        </button>
        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-4 py-2 border rounded-md disabled:opacity-50">
          Berikutnya
        </button>
      </div>

    </div>

    <div v-if="isProductModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        </div>

    <div v-if="isStockInModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        </div>

  </div>
</template>

<script setup>
// ... (TIDAK ADA PERUBAHAN PADA BAGIAN SCRIPT) ...
import { ref, reactive, onMounted, computed } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { Plus, LogIn, Trash2 } from 'lucide-vue-next';

const productStore = useProductStore();
const { products, loading, currentPage, totalPages } = storeToRefs(productStore);

const searchQuery = ref('');
const isProductModalOpen = ref(false);
const isEditing = ref(false);
const editableProduct = reactive({
  id: null, name: '', sku: '', kategori: '', merk: '', satuan: '',
  stock: 0, hpp: 0, sell_price: 0
});
const isStockInModalOpen = ref(false);
const stockInData = reactive({
  productId: '', quantity: null, supplier: '', notes: ''
});

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
}

onMounted(() => {
  productStore.fetchProducts(1);
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.kategori && p.kategori.toLowerCase().includes(query)) ||
    (p.merk && p.merk.toLowerCase().includes(query))
  );
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    productStore.fetchProducts(page);
  }
}

const openProductModal = (product = null) => {
  const defaultProduct = {
    id: null, name: '', sku: '', kategori: '', merk: '', satuan: '',
    stock: 0, hpp: 0, sell_price: 0
  };
  if (product) {
    isEditing.value = true;
    Object.assign(editableProduct, product);
  } else {
    isEditing.value = false;
    Object.assign(editableProduct, defaultProduct);
  }
  isProductModalOpen.value = true;
};

const closeProductModal = () => isProductModalOpen.value = false;

const handleSaveProduct = async () => {
  try {
    if (isEditing.value) {
      await productStore.updateProduct(editableProduct);
    } else {
      await productStore.addProduct(editableProduct);
    }
    closeProductModal();
  } catch (error) { /* Error ditangani di store */ }
};

const handleDeleteProduct = async (productId, productName) => {
  if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
    try {
      await productStore.deleteProduct(productId);
    } catch (error) { /* Error ditangani di store */ }
  }
};

const openStockInModal = () => {
  Object.assign(stockInData, { productId: '', quantity: null, supplier: '', notes: '' });
  isStockInModalOpen.value = true;
};

const closeStockInModal = () => {
  isStockInModalOpen.value = false;
};

const handleSaveStockIn = async () => {
  if (!stockInData.productId || !stockInData.quantity) {
    alert('Produk dan jumlah harus diisi.');
    return;
  }
  try {
    await axios.post('/stock-entries', stockInData);
    alert('Stok berhasil dicatat!');
    closeStockInModal();
    await productStore.fetchProducts(currentPage.value);
  } catch (error) {
    alert(`Gagal mencatat stok: ${error.response?.data?.message || error.message}`);
  }
};
</script>