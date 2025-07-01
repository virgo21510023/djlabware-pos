<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    <div class="md:col-span-2">
      <div class="bg-surface dark:bg-dark-surface rounded-lg flex flex-col h-[calc(100vh-5.5rem)] overflow-y-auto">
        <div class="sticky top-0 z-10 p-4 bg-surface dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700">
          <input 
            type="text" 
            placeholder="Cari produk (nama, kategori, merk)..." 
            v-model="searchQuery"
            class="w-full p-3 bg-background dark:bg-dark-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="px-4 pb-4">
          <div v-if="loading" class="text-center mt-4">Memuat produk...</div>
          <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <li 
              v-for="product in filteredProducts" 
              :key="product.id" 
              @click="addToCart(product)"
              class="p-4 flex justify-between items-center cursor-pointer hover:bg-primary/5 dark:hover:bg-dark-primary/10 rounded-lg"
            >
              <div class="flex-1 min-w-0">
                <p class="text-base font-semibold text-on-surface dark:text-dark-on-surface truncate">{{ product.name }}</p>
                <p class="text-sm text-secondary dark:text-dark-secondary">{{ product.kategori }} - {{ product.merk }}</p>
              </div>
              <div class="text-right ml-4 flex-shrink-0">
                <p class="text-lg font-bold text-primary dark:text-dark-primary">Rp {{ formatRupiah(product.sell_price) }}</p>
                <p class="text-sm text-secondary dark:text-dark-secondary">Stok: {{ product.stock }} {{ product.satuan }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="md:col-span-1">
      <div class="sticky top-6">
        <div class="bg-surface dark:bg-dark-surface rounded-lg p-4 h-full flex flex-col h-[calc(100vh-8.5rem)]">
          <h3 class="text-xl font-bold mb-4 flex-shrink-0">Keranjang</h3>
          
          <div class="flex-grow overflow-y-auto">
            <p v-if="cart.length === 0" class="text-secondary dark:text-dark-secondary">Keranjang masih kosong.</p>
            <div v-else v-for="(item, index) in cart" :key="item.id" class="grid grid-cols-3 gap-2 items-center mb-4 pr-2">
              <div class="col-span-2">
                <p class="font-medium truncate">{{ item.name }}</p>
                <p class="text-sm text-secondary dark:text-dark-secondary">
                  Rp {{ formatRupiah(item.sell_price) }} / {{ item.satuan }}
                </p>
              </div>
              <div class="flex justify-end">
                <button @click="cart.splice(index, 1)" class="text-gray-400 hover:text-red-500">
                  <Trash2 class="w-5 h-5"/>
                </button>
              </div>
              <div class="col-span-3 flex items-center justify-between bg-background dark:bg-dark-background rounded-md p-1">
                <button @click="updateQuantity(item, -1)" class="px-3 py-1 rounded text-lg font-bold">-</button>
                <input 
                  type="number" 
                  v-model.number="item.quantity"
                  @change="validateQuantity(item)"
                  min="1" :max="item.stock"
                  class="w-16 text-center bg-transparent font-semibold focus:outline-none"
                />
                <button @click="updateQuantity(item, 1)" class="px-3 py-1 rounded text-lg font-bold">+</button>
              </div>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex justify-between items-center text-2xl font-bold mb-4">
              <span>Total</span>
              <span>Rp {{ total }}</span>
            </div>
            <button @click="processPayment" :disabled="cart.length === 0 || paymentLoading"
              class="w-full py-3 text-white font-bold rounded-lg transition-colors bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
            >
              <LoaderCircle v-if="paymentLoading" class="animate-spin mr-2" />
              <span>Bayar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { Trash2, LoaderCircle } from 'lucide-vue-next';

const productStore = useProductStore();
const { products, loading } = storeToRefs(productStore);

const searchQuery = ref('');
const cart = ref([]);
const paymentLoading = ref(false);

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
}

onMounted(() => {
  productStore.fetchProducts();
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

const total = computed(() => {
  const totalAmount = cart.value.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0);
  return formatRupiah(totalAmount);
});

function addToCart(product) {
  if (product.stock <= 0) {
    alert("Stok produk habis!");
    return;
  }
  const cartItem = cart.value.find(item => item.id === product.id);
  if (cartItem) {
    if (cartItem.quantity < product.stock) {
      cartItem.quantity++;
    } else {
      alert(`Stok maksimal untuk ${product.name} telah tercapai.`);
    }
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
}

// FUNGSI BARU UNTUK +/-
function updateQuantity(item, amount) {
  const newQuantity = item.quantity + amount;
  if (newQuantity > 0 && newQuantity <= item.stock) {
    item.quantity = newQuantity;
  } else if (newQuantity > item.stock) {
    alert(`Stok maksimal untuk ${item.name} adalah ${item.stock}.`);
    item.quantity = item.stock;
  }
}

// FUNGSI BARU UNTUK VALIDASI INPUT MANUAL
function validateQuantity(item) {
  if (item.quantity > item.stock) {
    alert(`Stok maksimal untuk ${item.name} adalah ${item.stock}.`);
    item.quantity = item.stock;
  } else if (item.quantity < 1) {
    item.quantity = 1;
  }
}

async function processPayment() {
  if (cart.value.length === 0) return;
  paymentLoading.value = true;
  try {
    const payload = {
      items: cart.value.map(item => ({ id: item.id, quantity: item.quantity })),
      payment_method: 'Tunai'
    };
    await axios.post('/transactions', payload);
    alert('Transaksi berhasil!');
    cart.value = [];
    await productStore.fetchProducts();
  } catch (error) {
    alert(`Transaksi gagal: ${error.response?.data?.message || error.message}`);
  } finally {
    paymentLoading.value = false;
  }
}
</script>