<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
    <div class="md:col-span-2 bg-surface dark:bg-dark-surface rounded-lg p-4 flex flex-col">
        <input type="text" placeholder="Cari produk (nama/SKU)..." v-model="searchQuery"
            class="w-full p-3 mb-4 bg-background dark:bg-dark-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div class="flex-grow overflow-y-auto pr-2">
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="product in filteredProducts" :key="product.id" @click="addToCart(product)"
                    class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary dark:hover:border-dark-primary hover:shadow-lg transition-all"
                >
                    <p class="font-semibold truncate">{{ product.name }}</p>
                    <p class="text-sm text-secondary dark:text-dark-secondary">Stok: {{ product.stock }}</p>
                    <p class="text-lg font-bold text-primary dark:text-dark-primary mt-2">Rp {{ product.sell_price }}</p>
                </div>
            </div>
             <p v-if="loading" class="text-center mt-4">Memuat produk...</p>
        </div>
    </div>

    <div class="md:col-span-1 bg-surface dark:bg-dark-surface rounded-lg p-4 flex flex-col">
        <h3 class="text-xl font-bold mb-4">Keranjang</h3>
        <div class="flex-grow overflow-y-auto">
            <p v-if="cart.length === 0" class="text-secondary dark:text-dark-secondary">Keranjang masih kosong.</p>
            <div v-else v-for="(item, index) in cart" :key="item.id" class="flex items-center justify-between mb-3">
                <div>
                    <p class="font-medium">{{ item.name }}</p>
                    <p class="text-sm text-secondary dark:text-dark-secondary">Rp {{ item.sell_price }}</p>
                </div>
                <div class="flex items-center">
                    <input type="number" v-model.number="item.quantity" min="1" :max="item.stock" class="w-16 text-center bg-transparent border rounded-md mx-2"/>
                    <button @click="cart.splice(index, 1)" class="text-red-500 hover:text-red-400">
                        <Trash2 class="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
        <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { Trash2, LoaderCircle } from 'lucide-vue-next';

// Setup Product Store
const productStore = useProductStore();
// Gunakan storeToRefs agar state (products, loading) tetap reaktif
const { products, loading } = storeToRefs(productStore);

// State lokal untuk halaman POS
const searchQuery = ref('');
const cart = ref([]);
const paymentLoading = ref(false);

// Panggil action untuk fetch produk saat komponen pertama kali dimuat
onMounted(() => {
  productStore.fetchProducts();
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0).toLocaleString('id-ID');
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
    await productStore.fetchProducts(); // Refresh product list untuk update stok
  } catch (error) {
    alert(`Transaksi gagal: ${error.response?.data?.message || error.message}`);
  } finally {
    paymentLoading.value = false;
  }
}
</script>