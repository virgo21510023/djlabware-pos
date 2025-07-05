<template>
  <div class="flex flex-col h-[calc(100vh-8.5rem)]">
    
    <div class="flex-shrink-0">
      <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Manajemen Inventaris</h1>
      <p class="mt-2 text-secondary dark:text-dark-secondary">Tambah, lihat, dan perbarui data produk Anda.</p>
    </div>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow flex flex-col flex-grow min-h-0">
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
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Stok</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Harga Beli (HPP)</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Harga Jual</th>
              <th class="relative px-6 py-3"><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Memuat data...</td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="6" class="text-center py-4">Tidak ada data produk.</td>
            </tr>
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ product.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.kategori }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }} {{ product.satuan }}</td>
              <td class="px-6 py-4 whitespace-nowrap">Rp {{ formatRupiah(product.hpp) }}</td>
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
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Produk' : 'Tambah Produk Baru' }}</h2>
        <form @submit.prevent="handleSaveProduct" class="grid grid-cols-2 gap-4">
          <input v-model="editableProduct.name" type="text" placeholder="Nama Produk" required class="col-span-2 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <input v-model="editableProduct.kategori" type="text" placeholder="Kategori (e.g. Alat Gelas)" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <input v-model="editableProduct.merk" type="text" placeholder="Merk / Grade" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <input v-model.number="editableProduct.stock" type="number" placeholder="Stok Awal" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <input v-model="editableProduct.satuan" type="text" placeholder="Satuan (e.g. Pcs, Kg)" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <input v-model.number="editableProduct.hpp" type="number" placeholder="Harga Pokok (HPP)" required class="col-span-2 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <input v-model.number="editableProduct.sell_price" type="number" placeholder="Harga Jual" required class="col-span-2 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <input v-model="editableProduct.sku" type="text" placeholder="SKU (Opsional)" class="col-span-2 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          <div class="col-span-2 mt-2 flex justify-end space-x-4">
            <button type="button" @click="closeProductModal" class="px-4 py-2 rounded-md border">Batal</button>
            <button type="submit" class="px-4 py-2 rounded-md bg-primary text-white">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isStockInModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-bold mb-4">Catat Stok Masuk</h2>
        <form @submit.prevent="handleSaveStockIn">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium">Pilih Produk</label>
              <select v-model="stockInData.productId" required class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
                <option disabled value="">-- Pilih produk --</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} (Stok: {{ product.stock }})
                </option>
              </select>
            </div>
            <input v-model.number="stockInData.quantity" type="number" placeholder="Jumlah Masuk" min="1" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <input v-model="stockInData.supplier" type="text" placeholder="Nama Supplier (Opsional)" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <textarea v-model="stockInData.notes" placeholder="Catatan (Opsional)" rows="3" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background"></textarea>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="closeStockInModal" class="px-4 py-2 rounded-md border">Batal</button>
            <button type="submit" class="px-4 py-2 rounded-md bg-green-600 text-white">Simpan Stok</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { Plus, LogIn, Trash2 } from 'lucide-vue-next';
import { debounce } from 'lodash-es';
import { useToast } from "vue-toastification";

const toast = useToast();

// Setup Store
const productStore = useProductStore();
// PERBAIKAN: Gunakan 'paginatedProducts' dan ganti namanya menjadi 'products' untuk digunakan di template
const { paginatedProducts: products, loading, currentPage, totalPages } = storeToRefs(productStore);

// State lokal
const searchQuery = ref('');
const isProductModalOpen = ref(false);
const isEditing = ref(false);
const editableProduct = reactive({
  id: null, name: '', sku: '', kategori: '', merk: '', satuan: '',
  stock: 0, hpp: 0, sell_price: 0
});
const isStockInModalOpen = ref(false);
const stockInData = reactive({
  productId: '',
  quantity: null,
  supplier: '',
  notes: ''
});

// Helper Function
const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
}

// Ambil data saat komponen dimuat
onMounted(() => {
  productStore.fetchProducts(1);
});

// Fungsi untuk Paginasi
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    productStore.fetchProducts(page, searchQuery.value);
  }
}

// Gunakan 'watch' untuk memicu pencarian server-side
watch(searchQuery, debounce((newQuery) => {
  productStore.fetchProducts(1, newQuery);
}, 500));


// Fungsi untuk Modal Produk
const openProductModal = (product = null) => {
  const defaultProduct = {
    id: null, name: '', sku: '', kategori: '', merk: '', satuan: 'Pcs',
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
      toast.success(`Produk "${editableProduct.name}" berhasil diperbarui.`);
    } else {
      await productStore.addProduct(editableProduct);
      toast.success(`Produk "${editableProduct.name}" berhasil ditambahkan.`);
    }
    closeProductModal();
  } catch (error) {
    toast.error('Gagal menyimpan produk.');
  }
};

const handleDeleteProduct = async (productId, productName) => {
  if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
    try {
      await productStore.deleteProduct(productId);
      toast.success(`Produk "${productName}" berhasil dihapus.`);
    } catch (error) {
      toast.error('Gagal menghapus produk.');
    }
  }
};

// Fungsi untuk Modal Stok Masuk
const openStockInModal = () => {
  Object.assign(stockInData, { productId: '', quantity: null, supplier: '', notes: '' });
  isStockInModalOpen.value = true;
};

const closeStockInModal = () => {
  isStockInModalOpen.value = false;
};

const handleSaveStockIn = async () => {
  if (!stockInData.productId || !stockInData.quantity) {
    toast.warning('Produk dan jumlah harus diisi.');
    return;
  }
  try {
    await axios.post('/stock-entries', stockInData);
    toast.success('Stok berhasil dicatat!');
    closeStockInModal();
    await productStore.fetchProducts(currentPage.value, searchQuery.value);
  } catch (error) {
    toast.error(`Gagal mencatat stok: ${error.response?.data?.message || error.message}`);
  }
};
</script>