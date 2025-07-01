<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Manajemen Inventaris</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Tambah, lihat, dan perbarui data produk Anda.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Cari produk..." 
          class="w-full sm:w-72 p-2 border rounded-md bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button @click="openModal" class="w-full sm:w-auto mt-2 sm:mt-0 bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 flex items-center justify-center">
          <Plus class="w-5 h-5 mr-2" />
          Tambah Produk
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">SKU</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">Nama Produk</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">Stok</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">HPP</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">Harga Jual</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">Aksi</span></th>
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
              <td class="px-6 py-4 whitespace-nowrap">{{ product.sku }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ product.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.stock }}</td>
              <td class="px-6 py-4 whitespace-nowrap">Rp {{ Number(product.hpp).toLocaleString('id-ID') }}</td>
              <td class="px-6 py-4 whitespace-nowrap">Rp {{ Number(product.sell_price).toLocaleString('id-ID') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary hover:text-primary/80">Edit</button>
                <button class="text-red-500 hover:text-red-400 ml-4">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-bold mb-4">Tambah Produk Baru</h2>
        <form @submit.prevent="handleSaveProduct">
          <div class="space-y-4">
            <input v-model="newProduct.sku" type="text" placeholder="SKU (Kode Unik)" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <input v-model="newProduct.name" type="text" placeholder="Nama Produk" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <input v-model.number="newProduct.stock" type="number" placeholder="Stok Awal" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <input v-model.number="newProduct.hpp" type="number" placeholder="Harga Pokok (HPP)" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <input v-model.number="newProduct.sell_price" type="number" placeholder="Harga Jual" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded-md border">Batal</button>
            <button type="submit" class="px-4 py-2 rounded-md bg-primary text-white">Simpan</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import { Plus } from 'lucide-vue-next';

// Setup Store
const productStore = useProductStore();
const { products, loading } = storeToRefs(productStore);

// State untuk halaman ini
const searchQuery = ref('');
const isModalOpen = ref(false);
const newProduct = reactive({
  sku: '',
  name: '',
  stock: 0,
  hpp: 0,
  sell_price: 0
});

// Ambil data saat komponen dimuat
onMounted(() => {
  productStore.fetchProducts();
});

// Fungsi filter untuk pencarian
const filteredProducts = computed(() => {
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

// Fungsi untuk Modal
const openModal = () => {
  // Reset form
  Object.assign(newProduct, { sku: '', name: '', stock: 0, hpp: 0, sell_price: 0 });
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSaveProduct = async () => {
  try {
    await productStore.addProduct(newProduct);
    closeModal();
    console.log("Data produk setelah disimpan:", productStore.products);
    
  } catch (error) {
    // UBAH BARIS INI:
    // console.log("Gagal menyimpan dari komponen");
    
    // MENJADI SEPERTI INI:
    console.error("Error ditangkap oleh komponen:", error);
  }
};
</script>