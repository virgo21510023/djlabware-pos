<template>
  <div class="flex flex-col h-[calc(100vh-8.5rem)]">
    
    <div class="flex-shrink-0">
      <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Manajemen Inventaris</h1>
      <p class="mt-2 text-secondary dark:text-dark-secondary">Lihat, kelola, dan lacak riwayat stok produk Anda.</p>
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
              <th class="w-12"></th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Nama Produk</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Merk</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Stok</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Harga Jual</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
            <tr v-else-if="products.length === 0"><td colspan="6" class="text-center py-4">Tidak ada data produk.</td></tr>
            
            <template v-for="product in products" :key="product.id">
              <tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" @click="toggleDetails(product)">
                <td class="px-4 py-4 text-center">
                  <ChevronRight class="w-5 h-5 transition-transform" :class="{ 'rotate-90': expandedProductId === product.id }" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium">{{ product.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ product.merk }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }} {{ product.satuan }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">Rp {{ formatRupiah(product.sell_price) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click.stop="openProductModal(product)" class="text-primary hover:text-primary/80">Edit</button>
                  <button @click.stop="handleDeleteProduct(product.id, product.name)" class="text-red-500 hover:text-red-400 ml-4">Hapus</button>
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
                        <span>{{ formatTanggal(history.Purchase.purchase_date) }} - <span class="italic">{{ history.Purchase.supplier_name }}</span></span>
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
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Produk' : 'Tambah Produk Baru' }}</h2>
        <form @submit.prevent="handleSaveProduct" class="space-y-4">
          <div>
            <label for="productName" class="block text-sm font-medium">Nama Produk</label>
            <input v-model="editableProduct.name" id="productName" type="text" required class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="productCategory" class="block text-sm font-medium">Kategori</label>
              <input v-model="editableProduct.kategori" id="productCategory" type="text" list="category-list" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
             <div>
              <label for="productBrand" class="block text-sm font-medium">Merk</label>
              <input v-model="editableProduct.merk" id="productBrand" type="text" list="brand-list" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
          </div>
           <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="productStock" class="block text-sm font-medium">Stok</label>
              <input v-model.number="editableProduct.stock" id="productStock" type="number" required class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
             <div>
              <label for="productUnit" class="block text-sm font-medium">Satuan</label>
              <input v-model="editableProduct.satuan" id="productUnit" type="text" required class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            </div>
          </div>
          <hr>
           <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="productHpp" class="block text-sm font-medium text-blue-600">Harga Beli (HPP)</label>
              <CurrencyInput v-model="editableProduct.hpp" id="productHpp"/>
            </div>
            <div>
              <label for="productSellPrice" class="block text-sm font-medium text-green-600">Harga Jual</label>
              <CurrencyInput v-model="editableProduct.sell_price" id="productSellPrice"/>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { Plus, ChevronRight, Trash2 } from 'lucide-vue-next';
import { useToast } from "vue-toastification";
import { debounce } from 'lodash-es';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import CurrencyInput from '../components/CurrencyInput.vue';

const productStore = useProductStore();
const { paginatedProducts: products, loading, currentPage, totalPages } = storeToRefs(productStore);
const toast = useToast();

const searchQuery = ref('');
const isProductModalOpen = ref(false);
const isEditing = ref(false);
const expandedProductId = ref(null);
const allCategories = ref([]);
const allBrands = ref([]);

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
  console.log("--- [DEBUG] Tombol Simpan di Modal Ditekan ---");
  console.log("Status isEditing:", isEditing.value);
  console.log("Data yang akan disimpan:", JSON.parse(JSON.stringify(editableProduct)));

  try {
    const payload = {
      ...editableProduct,
      hpp: Number(editableProduct.hpp || 0),
      sell_price: Number(editableProduct.sell_price || 0),
      stock: Number(editableProduct.stock || 0)
    };

    if (isEditing.value) {
      console.log("--- [DEBUG] Masuk ke mode EDIT. Memanggil productStore.updateProduct... ---");
      await productStore.updateProduct(payload);
      toast.success(`Produk "${payload.name}" berhasil diperbarui.`);
    } else {
      console.log("--- [DEBUG] Masuk ke mode TAMBAH BARU. Memanggil productStore.addProduct... ---");
      await productStore.addProduct(payload);
      toast.success(`Produk "${payload.name}" berhasil ditambahkan.`);
    }
    closeProductModal();
  } catch (error) {
    toast.error('Gagal menyimpan produk.');
    console.error("Error dari handleSaveProduct:", error);
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
</script>