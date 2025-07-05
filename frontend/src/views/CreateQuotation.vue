<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Buat Penawaran Baru</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Isi detail penawaran untuk pelanggan.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="customerName" class="block text-sm font-medium">Nama Pelanggan</label>
          <input v-model="quotation.customer_name" type="text" id="customerName" placeholder="Wajib diisi" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="quotationDate" class="block text-sm font-medium">Tanggal Penawaran</label>
          <input v-model="quotation.quotation_date" type="date" id="quotationDate" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
        <div>
          <label for="validUntil" class="block text-sm font-medium">Berlaku Hingga</label>
          <input v-model="quotation.valid_until" type="date" id="validUntil" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
        </div>
      </div>
    </div>

    <div class="mt-4 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
      <h3 class="text-lg font-bold mb-4">Item Penawaran</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="py-2 text-left w-2/5">Nama Produk/Jasa</th>
              <th class="py-2 text-left">Status Stok</th> <th class="py-2 text-left">Merk</th>
              <th class="py-2 text-left">Qty</th>
              <th class="py-2 text-left">Satuan</th>
              <th class="py-2 text-left">Harga Satuan</th>
              <th class="py-2 text-right">Subtotal</th>
              <th class="py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in quotation.items" :key="index" class="border-t">
              <td class="py-2 pr-2 align-top relative">
                <input 
                  type="text" 
                  v-model="item.name"
                  @input="searchProducts(item)"
                  @keydown.down.prevent="moveSuggestion(1, item)"
                  @keydown.up.prevent="moveSuggestion(-1, item)"
                  @keydown.enter.prevent="selectProduct(item, item.suggestions[item.suggestion_index])"
                  placeholder="Ketik untuk cari atau tambah custom"
                  class="w-full p-2 border rounded-md"
                >
                <ul v-if="item.suggestions && item.suggestions.length" class="border rounded-md mt-1 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 z-20 absolute w-full">
                  <li v-for="(p, s_index) in item.suggestions" :key="p.id" 
                      @click="selectProduct(item, p)" 
                      class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      :class="{ 'bg-primary text-white': s_index === item.suggestion_index }"
                  >
                    {{ p.name }} - <span class="text-sm text-gray-500">{{ p.merk }}</span>
                  </li>
                </ul>
                <div v-if="item.is_new && item.name" class="mt-2 space-y-2 p-2 border-l-2 border-blue-500">
                  <input v-model="item.kategori" type="text" list="category-list" placeholder="Kategori" class="w-full p-1 border rounded-md text-sm">
                </div>
              </td>
              
              <td class="py-2 pr-2 align-top">
                <select v-model="item.stock_status" class="w-full p-2 border rounded-md">
                  <option>Ready</option>
                  <option>PO</option>
                </select>
              </td>

              <td class="py-2 pr-2 align-top"><input v-model="item.merk" type="text" list="brand-list" class="w-28 p-2 border rounded-md" :disabled="!item.is_new"></td>
              <td class="py-2 pr-2 align-top"><input v-model.number="item.quantity" type="number" min="1" class="w-20 p-2 border rounded-md"></td>
              <td class="py-2 pr-2 align-top"><input v-model="item.satuan" type="text" class="w-20 p-2 border rounded-md" :disabled="!item.is_new"></td>
              <td class="py-2 pr-2 align-top"><input v-model.number="item.price" type="number" class="w-36 p-2 border rounded-md"></td>
              <td class="py-2 pr-2 text-right font-semibold align-top">Rp {{ formatRupiah(item.quantity * item.price) }}</td>
              <td class="py-2 text-center align-top"><button @click="removeItem(index)" class="text-red-500">Hapus</button></td>
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

    <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-4">
        <label for="notes" class="block text-sm font-medium">Catatan Penawaran</label>
        <textarea v-model="quotation.notes" id="notes" rows="8" class="w-full p-2 border rounded-md" placeholder="Contoh: Harga Franco, Syarat dan Ketentuan, dll."></textarea>
      </div>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-3">
        <div class="flex justify-between items-center"><span class="font-medium">Subtotal</span> <span class="font-semibold">Rp {{ formatRupiah(subtotal) }}</span></div>
        <hr>
        <div class="flex justify-between items-center">
          <label for="discount" class="font-medium">Diskon (%)</label>
          <div class="flex items-center">
            <input v-model.number="quotation.discount_percentage" id="discount" type="number" class="w-20 p-1 border rounded-md text-right">
            <span class="ml-2 font-semibold">%</span>
          </div>
        </div>
        <div class="flex justify-between items-center text-sm text-red-500">
            <span>Nominal Diskon</span>
            <span>- Rp {{ formatRupiah(discount_amount) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <label for="shipping" class="font-medium">Biaya Kirim</label>
          <input v-model.number="quotation.shipping_cost" id="shipping" type="number" class="w-32 p-1 border rounded-md text-right">
        </div>
        <hr>
        <div class="flex justify-between items-center">
          <label for="vatToggle" class="font-medium">PPN 11%</label>
          <button id="vatToggle" @click="toggleVAT" :class="vat_enabled ? 'bg-primary' : 'bg-gray-300'" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"></button>
        </div>
        <div v-if="vat_enabled" class="flex justify-between items-center"><span class="font-medium">PPN (11%)</span> <span class="font-semibold">Rp {{ formatRupiah(vat_amount) }}</span></div>
        <hr class="border-2">
        <div class="flex justify-between items-center text-xl font-bold"><span class="">Grand Total</span> <span class="text-primary">Rp {{ formatRupiah(grand_total) }}</span></div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-end">
      <button @click="saveQuotation" class="bg-primary text-white font-bold py-3 px-6 rounded-md text-lg">
        Simpan Penawaran
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es';
import { useToast } from "vue-toastification";

const toast = useToast();
const productStore = useProductStore();
const { allProducts } = storeToRefs(productStore);
const router = useRouter();

const allCategories = ref([]);
const allBrands = ref([]);

const createNewItem = () => ({
  product_id: null,
  name: '',
  merk: '',
  satuan: 'Pcs',
  kategori: '',
  stock_status: 'Ready',
  quantity: 1,
  price: 0,
  item_notes: '',
  is_new: true,
  suggestions: [],
  suggestion_index: -1,
});

const quotation = reactive({
  customer_name: '',
  quotation_date: new Date().toISOString().split('T')[0],
  valid_until: '',
  items: [createNewItem()],
  notes: '',
  discount_percentage: 0,
  shipping_cost: 0,
  vat_percentage: 0,
});

const vat_enabled = ref(false);

const subtotal = computed(() => quotation.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0));
const discount_amount = computed(() => subtotal.value * ((quotation.discount_percentage || 0) / 100));
const vat_amount = computed(() => vat_enabled.value ? (subtotal.value - discount_amount.value) * 0.11 : 0);
const grand_total = computed(() => (subtotal.value - discount_amount.value) + (quotation.shipping_cost || 0) + vat_amount.value);

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
    console.error("Gagal mengambil data kategori/merk:", error);
  }
});

const addItem = () => quotation.items.push(createNewItem());
const removeItem = (index) => {
  if (quotation.items.length > 1) {
    quotation.items.splice(index, 1);
  }
};

const searchProducts = debounce((item) => {
  if (!item.name || item.name.length < 2) {
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
  const index = quotation.items.indexOf(item);
  if (index > -1) {
    Object.assign(quotation.items[index], {
      ...createNewItem(),
      product_id: product.id,
      name: product.name,
      merk: product.merk,
      satuan: product.satuan,
      price: product.sell_price,
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
  quotation.vat_percentage = vat_enabled.value ? 11 : 0;
};

const saveQuotation = async () => {
  try {
    const payload = { ...quotation };
    await axios.post('/quotations', payload);
    toast.success('Penawaran berhasil disimpan!');
    router.push('/quotations');
  } catch (error) {
    toast.error(`Gagal menyimpan: ${error.response?.data?.message || error.message}`);
  }
};

const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');
</script>