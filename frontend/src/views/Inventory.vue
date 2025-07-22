<template>
  <div class="flex flex-col h-[calc(100vh-8.5rem)]">

    <div class="flex-shrink-0">
      <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Manajemen Inventaris</h1>
      <p class="mt-2 text-secondary dark:text-dark-secondary">Lihat, kelola, dan lacak riwayat stok produk Anda.</p>
    </div>

    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow flex flex-col flex-grow min-h-0">
      <div class="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input type="text" v-model="searchQuery" placeholder="Cari produk..."
          class="w-full sm:w-72 p-2 border rounded-md bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary" />
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="isImportModalOpen = true"
            class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center">
            <Upload class="w-5 h-5 mr-2" />
            Impor
          </button>
          <button @click="openProductModal()"
            class="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 flex items-center justify-center">
            <Plus class="w-5 h-5 mr-2" />
            Tambah Produk
          </button>
        </div>
      </div>

      <div class="overflow-x-auto flex-grow overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th class="w-12"></th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Nama Produk</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Merk</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Stok</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Harga Jual</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">Memuat data...</td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="6" class="text-center py-4">Tidak ada data produk.</td>
            </tr>

            <template v-for="product in products" :key="product.id">
              <tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" @click="toggleDetails(product)">
                <td class="px-4 py-4 text-center">
                  <ChevronRight class="w-5 h-5 transition-transform"
                    :class="{ 'rotate-90': expandedProductId === product.id }" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium">{{ product.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ product.merk }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }} {{ product.satuan }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">Rp {{ formatRupiah(product.sell_price)
                  }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click.stop="openProductModal(product)"
                    class="text-primary hover:text-primary/80">Edit</button>
                  <button @click.stop="openDeleteConfirm(product)"
                    class="text-red-500 hover:text-red-400 ml-4">Hapus</button>
                </td>
              </tr>
              <tr v-if="expandedProductId === product.id">
                <td></td>
                <td colspan="5" class="p-4 bg-gray-100 dark:bg-gray-800">
                  <div v-if="product.historyLoading" class="text-center text-sm">Memuat riwayat...</div>
                  <div v-else-if="product.purchaseHistory && product.purchaseHistory.length > 0">
                    <h4 class="font-bold mb-2 text-sm">Riwayat Harga Beli Terakhir:</h4>
                    <ul class="text-xs space-y-1">
                      <li v-for="history in product.purchaseHistory" :key="history.id" class="flex justify-between">
                        <span>{{ formatTanggal(history.Purchase.purchase_date) }} - <span class="italic">{{
                          history.Purchase.supplier_name }}</span></span>
                        <span class="font-semibold">Rp {{ formatRupiah(history.purchase_price) }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-else class="text-sm text-secondary">Belum ada riwayat pembelian untuk produk ini.</div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1"
        class="flex-shrink-0 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
          class="px-4 py-2 border rounded-md disabled:opacity-50">
          Sebelumnya
        </button>
        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
          class="px-4 py-2 border rounded-md disabled:opacity-50">
          Berikutnya
        </button>
      </div>
    </div>

    <div v-if="isProductModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Produk' : 'Tambah Produk Baru' }}</h2>
        <form @submit.prevent="handleSaveProduct" class="space-y-4">
          <div>
            <label for="productName" class="block text-sm font-medium">Nama Produk</label>
            <input v-model="editableProduct.name" id="productName" type="text" required
              class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="productCategory" class="block text-sm font-medium">Kategori</label>
              <input v-model="editableProduct.kategori" id="productCategory" type="text" list="category-list"
                class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
            <div>
              <label for="productBrand" class="block text-sm font-medium">Merk</label>
              <input v-model="editableProduct.merk" id="productBrand" type="text" list="brand-list"
                class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="productStock" class="block text-sm font-medium">Stok</label>
              <input v-model.number="editableProduct.stock" id="productStock" type="number" required
                class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
            <div>
              <label for="productUnit" class="block text-sm font-medium">Satuan</label>
              <input v-model="editableProduct.satuan" id="productUnit" type="text" required
                class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
          </div>
          <hr>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="productHpp" class="block text-sm font-medium text-blue-600">Harga Beli (HPP)</label>
              <CurrencyInput v-model="editableProduct.hpp" id="productHpp" />
            </div>
            <div>
              <label for="productSellPrice" class="block text-sm font-medium text-green-600">Harga Jual</label>
              <CurrencyInput v-model="editableProduct.sell_price" id="productSellPrice" />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="closeProductModal" class="px-4 py-2 rounded-md border">Batal</button>
            <button type="submit" class="px-4 py-2 rounded-md bg-primary text-white">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <datalist id="category-list">
      <option v-for="cat in allCategories" :key="cat" :value="cat"></option>
    </datalist>
    <datalist id="brand-list">
      <option v-for="brand in allBrands" :key="brand" :value="brand"></option>
    </datalist>

    <ConfirmModal :show="isConfirmModalOpen" :icon="AlertTriangle" title="Hapus Produk"
      :message="`Apakah Anda yakin ingin menghapus produk '${productToDelete?.name}'? Stok yang ada juga akan hilang.`"
      @cancel="closeConfirmModal" @confirm="deleteProduct" />

    <div v-if="isImportModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 class="text-xl font-bold mb-4">Impor Produk dari File</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold">Langkah 1: Unduh Template</h3>
            <p class="text-sm text-secondary">Gunakan template ini untuk memastikan format data Anda benar.</p>
            <a href="/template_impor_produk.xlsx" download
              class="mt-2 inline-block text-primary font-semibold hover:underline">
              Unduh Template Excel
            </a>
          </div>
          <hr>
          <div>
            <h3 class="font-semibold">Langkah 2: Unggah File</h3>
            <label for="import-file"
              class="mt-2 cursor-pointer border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary">
              <UploadCloud class="w-10 h-10 text-secondary" />
              <span class="mt-2 text-sm">{{ selectedFile ? selectedFile.name : 'Pilih atau jatuhkan file di sini'
                }}</span>
            </label>
            <input id="import-file" type="file" class="hidden" @change="handleFileSelect" accept=".xlsx, .csv">
          </div>
        </div>
        <div v-if="importErrors.length > 0"
          class="mt-4 p-3 bg-red-100 dark:bg-red-900/50 rounded-md max-h-40 overflow-y-auto">
          <p class="font-bold text-red-700 dark:text-red-300">Ditemukan Kesalahan:</p>
          <ul class="list-disc list-inside text-sm text-red-600 dark:text-red-300">
            <li v-for="(error, index) in importErrors" :key="index">{{ error }}</li>
          </ul>
        </div>
        <div class="mt-6 flex justify-end space-x-4">
          <button @click="closeImportModal" class="px-4 py-2 rounded-md border">Tutup</button>
          <button @click="processImport" :disabled="!selectedFile || importLoading"
            class="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50">
            <span v-if="importLoading">Memproses...</span>
            <span v-else>Mulai Impor</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { Plus, ChevronRight, Trash2, AlertTriangle, Upload, UploadCloud } from 'lucide-vue-next'; // Impor ikon baru
import { useToast } from "vue-toastification";
import { debounce } from 'lodash-es';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import CurrencyInput from '../components/CurrencyInput.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const productStore = useProductStore();
const { paginatedProducts: products, loading, currentPage, totalPages } = storeToRefs(productStore);
const toast = useToast();

const searchQuery = ref('');
const isProductModalOpen = ref(false);
const isEditing = ref(false);
const expandedProductId = ref(null);
const allCategories = ref([]);
const allBrands = ref([]);
const isConfirmModalOpen = ref(false);
const productToDelete = ref(null);

// State BARU untuk Modal Impor
const isImportModalOpen = ref(false);
const selectedFile = ref(null);
const importLoading = ref(false);
const importErrors = ref([]);

const editableProduct = reactive({
  id: null, name: '', sku: '', kategori: '', merk: '', satuan: '',
  stock: 0, hpp: 0, sell_price: 0
});

const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');
const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMM yy", { locale: id });
};

const toggleDetails = async (product) => {
  if (expandedProductId.value === product.id) {
    expandedProductId.value = null;
  } else {
    expandedProductId.value = product.id;
    if (!product.purchaseHistory) {
      product.historyLoading = true;
      try {
        const response = await axios.get(`/products/${product.id}/purchase-history`);
        product.purchaseHistory = response.data;
      } catch (error) {
        toast.error("Gagal memuat riwayat pembelian.");
      } finally {
        product.historyLoading = false;
      }
    }
  }
};

onMounted(async () => {
  productStore.fetchProducts(1);
  try {
    const [catRes, brandRes] = await Promise.all([
      axios.get('/utils/categories'),
      axios.get('/utils/brands')
    ]);
    allCategories.value = catRes.data;
    allBrands.value = brandRes.data;
  } catch (error) {
    toast.error("Gagal mengambil data kategori/merk.");
  }
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    productStore.fetchProducts(page, searchQuery.value);
  }
}

watch(searchQuery, debounce((newQuery) => {
  productStore.fetchProducts(1, newQuery);
}, 500));

const openProductModal = (product = null) => {
  const defaultProduct = {
    id: null, name: '', sku: '', kategori: '', merk: '', satuan: 'Pcs',
    stock: 0, hpp: 0, sell_price: 0
  };
  if (product) {
    isEditing.value = true;
    Object.assign(editableProduct, {
      ...product,
      hpp: Number(product.hpp || 0),
      sell_price: Number(product.sell_price || 0)
    });
  } else {
    isEditing.value = false;
    Object.assign(editableProduct, defaultProduct);
  }
  isProductModalOpen.value = true;
};

const closeProductModal = () => isProductModalOpen.value = false;

const handleSaveProduct = async () => {
  try {
    const payload = {
      ...editableProduct,
      hpp: Number(editableProduct.hpp || 0),
      sell_price: Number(editableProduct.sell_price || 0),
      stock: Number(editableProduct.stock || 0)
    };

    if (isEditing.value) {
      await productStore.updateProduct(payload);
      toast.success(`Produk "${payload.name}" berhasil diperbarui.`);
    } else {
      await productStore.addProduct(payload);
      toast.success(`Produk "${payload.name}" berhasil ditambahkan.`);
    }
    closeProductModal();
  } catch (error) {
    toast.error('Gagal menyimpan produk.');
    console.error("Error dari handleSaveProduct:", error);
  }
};

const openDeleteConfirm = (product) => {
  productToDelete.value = product;
  isConfirmModalOpen.value = true;
};

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false;
  productToDelete.value = null;
};

const deleteProduct = async () => {
  if (!productToDelete.value) return;
  try {
    await productStore.deleteProduct(productToDelete.value.id);
    toast.success(`Produk "${productToDelete.value.name}" berhasil dihapus.`);
  } catch (error) {
    toast.error('Gagal menghapus produk.');
  } finally {
    closeConfirmModal();
  }
};

// Fungsi BARU untuk Modal Impor
const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0] || null;
  importErrors.value = []; // Bersihkan error lama saat file baru dipilih
};

const closeImportModal = () => {
  isImportModalOpen.value = false;
  selectedFile.value = null;
  importErrors.value = [];
};

const processImport = async () => {
  if (!selectedFile.value) return toast.warning("Harap pilih file terlebih dahulu.");

  importLoading.value = true;
  importErrors.value = [];
  const formData = new FormData();
  formData.append('importFile', selectedFile.value);

  try {
    const response = await axios.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success(response.data.message);
    await productStore.fetchProducts(1);
    await productStore.fetchAllProducts();
    closeImportModal();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal mengimpor produk.');
    if (error.response?.data?.errors) {
      importErrors.value = error.response.data.errors;
    }
  } finally {
    importLoading.value = false;
  }
};
</script>