<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Buat Purchase Order Baru</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Pesan barang baru atau yang sudah ada ke supplier.</p>
    
    <!-- Info Dokumen -->
    <div class="mt-6 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="supplierName" class="block text-sm font-medium">Nama Supplier</label>
          <input v-model="po.supplier_name" type="text" id="supplierName" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="orderDate" class="block text-sm font-medium">Tanggal Pesan</label>
          <input v-model="po.order_date" type="date" id="orderDate" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="expectedDate" class="block text-sm font-medium">Perkiraan Tiba</label>
          <input v-model="po.expected_delivery_date" type="date" id="expectedDate" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
      </div>
    </div>

    <!-- Tabel Item Pembelian -->
    <div class="mt-4 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
       <h3 class="text-lg font-bold mb-4">Item Pesanan</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="py-2 text-left w-2/5">Nama Produk</th>
              <th class="py-2 text-left">Qty</th>
              <th class="py-2 text-left">Satuan</th>
              <th class="py-2 text-left">Perkiraan Harga Satuan</th>
              <th class="py-2 text-right">Subtotal</th>
              <th class="py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in po.items" :key="index" class="border-t">
              <td class="py-2 pr-2 align-top relative">
                <input 
                  type="text" 
                  v-model="item.name"
                  @input="searchProducts(item)"
                  @keydown.down.prevent="moveSuggestion(1, item)"
                  @keydown.up.prevent="moveSuggestion(-1, item)"
                  @keydown.enter.prevent="selectProduct(item, item.suggestions[item.suggestion_index])"
                  placeholder="Ketik untuk cari atau tambah baru"
                  class="w-full p-2 border rounded-md bg-background dark:bg-dark-background"
                >
                <ul v-if="item.suggestions && item.suggestions.length" class="border rounded-md mt-1 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 z-20 absolute w-full shadow-lg">
                  <li v-for="(p, s_index) in item.suggestions" :key="p.id" 
                      @click="selectProduct(item, p)" 
                      class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      :class="{ 'bg-primary text-white': s_index === item.suggestion_index }"
                  >
                    {{ p.name }}
                  </li>
                </ul>
                <div v-if="item.is_new && item.name" class="mt-2 space-y-2 p-2 border-l-2 border-primary">
                  <p class="text-xs text-secondary">Detail untuk produk baru:</p>
                  <input v-model="item.kategori" type="text" list="category-list" placeholder="Kategori" class="w-full p-1 border rounded-md text-sm bg-background dark:bg-dark-background">
                  <input v-model="item.merk" type="text" list="brand-list" placeholder="Merk" class="w-full p-1 border rounded-md text-sm bg-background dark:bg-dark-background">
                </div>
              </td>
              <td class="py-2 pr-2 align-top"><input v-model.number="item.quantity_ordered" type="number" min="1" class="w-24 p-2 border rounded-md bg-background dark:bg-dark-background"></td>
              <td class="py-2 pr-2 align-top"><input v-model="item.satuan" type="text" class="w-24 p-2 border rounded-md bg-background dark:bg-dark-background" :disabled="!item.is_new"></td>
              <td class="py-2 pr-2 align-top"><input v-model.number="item.estimated_price" type="number" class="w-36 p-2 border rounded-md bg-background dark:bg-dark-background"></td>
              <td class="py-2 pr-2 text-right font-semibold align-top">Rp {{ formatRupiah(item.quantity_ordered * item.estimated_price) }}</td>
              <td class="py-2 text-center align-top"><button @click="removeItem(index)" class="text-red-500 p-2 rounded-full hover:bg-red-100"><Trash2 class="w-4 h-4"/></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button @click="addItem" class="mt-4 bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-md">+ Tambah Baris</button>
    </div>

    <datalist id="category-list">
      <option v-for="cat in allCategories" :key="cat" :value="cat"></option>
    </datalist>
    <datalist id="brand-list">
      <option v-for="brand in allBrands" :key="brand" :value="brand"></option>
    </datalist>

    <!-- Kalkulasi, Catatan & Total -->
    <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-4">
        <label for="notes" class="block text-sm font-medium">Catatan (Opsional)</label>
        <textarea v-model="po.notes" id="notes" rows="8" class="w-full p-2 border rounded-md bg-background dark:bg-dark-background" placeholder="Contoh: Mohon sertakan Certificate of Analysis (COA)."></textarea>
      </div>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-3">
        <div class="flex justify-between items-center"><span class="font-medium">Subtotal</span> <span class="font-semibold">Rp {{ formatRupiah(subtotal) }}</span></div>
        <hr>
        <div class="flex justify-between items-center">
          <label for="discount" class="font-medium">Diskon (%)</label>
          <div class="flex items-center">
            <input v-model.number="po.discount_percentage" id="discount" type="number" class="w-20 p-1 border rounded-md text-right bg-background dark:bg-dark-background">
            <span class="ml-2 font-semibold">%</span>
          </div>
        </div>
        <div class="flex justify-between items-center text-sm text-red-500">
            <span>Nominal Diskon</span>
            <span>- Rp {{ formatRupiah(discount_amount) }}</span>
        </div>
        <hr>
        <div class="flex justify-between items-center">
          <label for="vatToggle" class="font-medium">PPN 11%</label>
          <button id="vatToggle" @click="toggleVAT" :class="vat_enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"></button>
        </div>
        <div v-if="vat_enabled" class="flex justify-between items-center"><span class="font-medium">PPN (11%)</span> <span class="font-semibold">Rp {{ formatRupiah(vat_amount) }}</span></div>
        <hr class="border-2">
        <div class="flex justify-between items-center text-xl font-bold"><span class="">Grand Total</span> <span class="text-primary">Rp {{ formatRupiah(grand_total) }}</span></div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-end">
      <button @click="savePurchaseOrder" class="bg-primary text-white font-bold py-3 px-6 rounded-md text-lg">
        Simpan Purchase Order
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { debounce } from 'lodash-es';
import { Trash2 } from 'lucide-vue-next';

const router = useRouter();
const toast = useToast();
const productStore = useProductStore();
const { allProducts } = storeToRefs(productStore);

const allCategories = ref([]);
const allBrands = ref([]);

const createNewItem = () => ({
  product_id: null,
  name: '',
  quantity_ordered: 1,
  estimated_price: 0,
  is_new: true,
  kategori: '',
  merk: '',
  satuan: 'Pcs',
  suggestions: [],
  suggestion_index: -1,
});

const po = reactive({
  supplier_name: '',
  order_date: new Date().toISOString().split('T')[0],
  expected_delivery_date: '',
  notes: '',
  items: [createNewItem()],
  discount_percentage: 0,
  vat_percentage: 0,
});

const vat_enabled = ref(false);

const subtotal = computed(() => po.items.reduce((sum, item) => sum + ((item.quantity_ordered || 0) * (item.estimated_price || 0)), 0));
const discount_amount = computed(() => subtotal.value * ((po.discount_percentage || 0) / 100));
const vat_amount = computed(() => vat_enabled.value ? (subtotal.value - discount_amount.value) * 0.11 : 0);
const grand_total = computed(() => (subtotal.value - discount_amount.value) + vat_amount.value);

onMounted(async () => {
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

const addItem = () => {
  po.items.push(createNewItem());
};

const removeItem = (index) => {
  if (po.items.length > 1) {
    po.items.splice(index, 1);
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
  const index = po.items.indexOf(item);
  if (index !== -1) {
    Object.assign(po.items[index], {
      ...createNewItem(),
      product_id: product.id,
      name: product.name,
      estimated_price: product.hpp,
      kategori: product.kategori,
      merk: product.merk,
      satuan: product.satuan,
      is_new: false,
      suggestions: [],
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

const toggleVAT = () => {
  vat_enabled.value = !vat_enabled.value;
  po.vat_percentage = vat_enabled.value ? 11 : 0;
};

const savePurchaseOrder = async () => {
  if (!po.supplier_name) {
    return toast.error('Nama supplier harus diisi.');
  }
  for (const item of po.items) {
    if (!item.name || !item.quantity_ordered || item.quantity_ordered <= 0 || item.estimated_price < 0) {
      toast.error('Harap isi semua kolom item (Nama, Qty, Harga) dengan benar.');
      return;
    }
  }

  try {
    await axios.post('/purchase-orders', po);
    toast.success('Purchase Order berhasil dibuat!');
    router.push('/purchase-orders');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal membuat Purchase Order.');
  }
};

const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');
</script>