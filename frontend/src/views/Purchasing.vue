<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Form Pembelian</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Catat barang masuk dari supplier berdasarkan nota.</p>

    <div class="mt-6 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="purchaseDate" class="block text-sm font-medium">Tanggal Nota</label>
          <input v-model="purchase.purchase_date" type="date" id="purchaseDate"
            class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="invoiceNumber" class="block text-sm font-medium">Nomor Nota</label>
          <input v-model="purchase.invoice_number" type="text" id="invoiceNumber"
            class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="supplierName" class="block text-sm font-medium">Nama Supplier</label>
          <input v-model="purchase.supplier_name" type="text" id="supplierName"
            class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
      </div>
    </div>

    <div class="mt-4 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="py-2 text-left w-2/5">Nama Produk</th>
              <th class="py-2 text-left">Qty</th>
              <th class="py-2 text-left">Satuan</th>
              <th class="py-2 text-left">Harga Beli</th>
              <th class="py-2 text-left">Harga Jual</th>
              <th class="py-2 text-right">Subtotal</th>
              <th class="py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="purchase.items.length > 0">
              <tr v-for="(item, index) in purchase.items" :key="index" class="border-t">
                <td class="py-2 pr-2 align-top">
                  <div class="relative">
                    <input type="text" v-model="item.name" @input="searchProducts(item)"
                      @keydown.down.prevent="moveSuggestion(1, item)" @keydown.up.prevent="moveSuggestion(-1, item)"
                      @keydown.enter.prevent="selectProduct(item, item.suggestions[item.suggestion_index])"
                      placeholder="Ketik untuk cari atau tambah baru"
                      class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
                    <ul v-if="item.suggestions && item.suggestions.length"
                      class="border rounded-md mt-1 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 z-20 absolute w-full">
                      <li v-for="(p, s_index) in item.suggestions" :key="p.id" @click="selectProduct(item, p)"
                        class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        :class="{ 'bg-primary text-white': s_index === item.suggestion_index }">
                        {{ p.name }}
                      </li>
                    </ul>
                  </div>
                  <div v-if="item.is_new && item.name" class="mt-2 space-y-2 p-2 border-l-2 border-blue-500">
                    <input v-model="item.kategori" type="text" list="category-list" placeholder="Kategori"
                      class="w-full p-1 border rounded-md text-sm bg-background dark:bg-dark-background">
                    <input v-model="item.merk" type="text" list="brand-list" placeholder="Merk"
                      class="w-full p-1 border rounded-md text-sm bg-background dark:bg-dark-background">
                  </div>
                </td>
                <td class="py-2 pr-2 align-top"><input v-model.number="item.quantity" type="number" min="1"
                    class="w-20 p-2 border rounded-md bg-background dark:bg-dark-background"></td>
                <td class="py-2 pr-2 align-top"><input v-model="item.satuan" type="text"
                    class="w-20 p-2 border rounded-md bg-background dark:bg-dark-background" :disabled="!item.is_new">
                </td>
                <td class="py-2 pr-2 align-top"><input v-model.number="item.purchase_price" type="number"
                    class="w-36 p-2 border rounded-md bg-background dark:bg-dark-background"></td>
                <td class="py-2 pr-2 align-top"><input v-model.number="item.sell_price" type="number"
                    class="w-36 p-2 border rounded-md bg-background dark:bg-dark-background"></td>
                <td class="py-2 pr-2 text-right font-semibold align-top">Rp {{ formatRupiah(item.quantity *
                  item.purchase_price) }}</td>
                <td class="py-2 text-center align-top"><button @click="removeItem(index)"
                    class="text-red-500">Hapus</button></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <button @click="addItem" class="mt-4 bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-md">+ Tambah
        Baris</button>
    </div>

    <datalist id="category-list">
      <option v-for="cat in allCategories" :key="cat" :value="cat"></option>
    </datalist>
    <datalist id="brand-list">
      <option v-for="brand in allBrands" :key="brand" :value="brand"></option>
    </datalist>

    <div class="mt-4 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow flex justify-between items-center">
      <div>
        <span class="text-xl font-bold">TOTAL PEMBELIAN:</span>
        <span class="text-2xl font-bold text-primary ml-4">Rp {{ formatRupiah(grandTotal) }}</span>
      </div>
      <button @click="savePurchase" class="bg-primary text-white font-bold py-3 px-6 rounded-md text-lg">
        Simpan Pembelian
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/product';
import { usePurchaseProcessStore } from '../stores/purchaseProcessStore';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { debounce } from 'lodash-es';

// Inisialisasi
const router = useRouter();
const toast = useToast();
const productStore = useProductStore();
const purchaseProcessStore = usePurchaseProcessStore();
const { allProducts } = storeToRefs(productStore);

// State Lokal
const allCategories = ref([]);
const allBrands = ref([]);

// Helper untuk membuat item baru
const createNewItem = () => ({
  product_id: null,
  name: '',
  quantity: 1,
  purchase_price: 0,
  sell_price: 0,
  is_new: true,
  satuan: 'Pcs',
  kategori: '',
  merk: '',
  suggestions: [],
  suggestion_index: -1,
});

// State utama untuk form pembelian
const purchase = reactive({
  purchase_date: new Date().toISOString().split('T')[0],
  invoice_number: '',
  supplier_name: '',
  purchase_order_id: null, // Untuk melacak PO asal
  items: []
});

// Lifecycle Hook
onMounted(async () => {
  // Cek apakah ada data PO yang dikirim dari halaman sebelumnya
  if (purchaseProcessStore.poToProcess) {
    const po = purchaseProcessStore.poToProcess;
    
    // Isi form dengan data dari PO
    purchase.purchase_date = new Date().toISOString().split('T')[0];
    purchase.invoice_number = `Ref PO: ${po.po_number}`;
    purchase.supplier_name = po.supplier_name;
    purchase.purchase_order_id = po.id;
    purchase.items = po.items.map(item => ({
      ...createNewItem(),
      product_id: item.product_id,
      name: item.Product.name,
      quantity: item.quantity_ordered,
      purchase_price: item.estimated_price,
      sell_price: item.Product.sell_price,
      is_new: false,
      satuan: item.Product.satuan,
      kategori: item.Product.kategori,
      merk: item.Product.merk,
    }));

    // Bersihkan store setelah data digunakan
    purchaseProcessStore.clearPoForPurchase();
  } else {
    // Jika tidak, mulai dengan satu baris kosong
    if (purchase.items.length === 0) {
      purchase.items.push(createNewItem());
    }
  }

  // Ambil data pendukung
  if (productStore.allProducts.length === 0) {
    await productStore.fetchAllProducts();
  }
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

// Methods
const addItem = () => {
  purchase.items.push(createNewItem());
};

const removeItem = (index) => {
  if (purchase.items.length > 1) {
    purchase.items.splice(index, 1);
  }
};

const searchProducts = debounce((item) => {
  if (!item.name || item.name.length < 1) {
    item.suggestions = [];
    return;
  }
  const query = item.name.toLowerCase();
  item.suggestions = allProducts.value.filter(p => p.name.toLowerCase().includes(query));
  item.suggestion_index = -1;
  
  const exactMatch = allProducts.value.find(p => p.name.toLowerCase() === query);
  item.is_new = !exactMatch;
}, 300);

const selectProduct = (item, product) => {
  if (!product) return;
  const index = purchase.items.indexOf(item);
  if (index !== -1) {
    Object.assign(purchase.items[index], {
      ...createNewItem(),
      product_id: product.id,
      name: product.name,
      purchase_price: product.hpp,
      sell_price: product.sell_price,
      satuan: product.satuan,
      kategori: product.kategori,
      merk: product.merk,
      is_new: false,
      suggestions: []
    });
  }
};

const moveSuggestion = (direction, item) => {
  if (!item.suggestions.length) return;
  const maxIndex = item.suggestions.length - 1;
  if (direction === 1 && item.suggestion_index < maxIndex) {
    item.suggestion_index++;
  } else if (direction === -1 && item.suggestion_index > 0) {
    item.suggestion_index--;
  }
};

const grandTotal = computed(() => purchase.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.purchase_price || 0)), 0));
const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');

const savePurchase = async () => {
  for (const item of purchase.items) {
    if (!item.name || !item.quantity || item.quantity <= 0 || !item.purchase_price || item.sell_price < 0) {
      toast.error('Harap isi semua kolom (Nama, Qty, Harga Beli, Harga Jual) dengan benar.');
      return;
    }
    if(item.is_new && (!item.kategori || !item.merk || !item.satuan)) {
      toast.error('Untuk produk baru, harap isi juga Kategori, Merk, dan Satuan.');
      return;
    }
  }

  try {
    await axios.post('/purchases', purchase);
    toast.success('Pembelian berhasil disimpan!');
    
    // Refresh data di store
    await productStore.fetchAllProducts();
    await productStore.fetchProducts(1); 
    
    // Arahkan ke halaman inventaris
    router.push('/inventory');
  } catch (error) {
    toast.error(`Gagal menyimpan: ${error.response?.data?.message || error.message}`);
  }
};
</script>