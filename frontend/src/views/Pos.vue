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
          
          <div class="flex-grow overflow-y-auto pr-2">
            <p v-if="cart.length === 0" class="text-center py-10 text-secondary dark:text-dark-secondary">Keranjang kosong.</p>
            <div v-else v-for="(item, index) in cart" :key="item.id" class="flex items-center justify-between mb-4">
              <div class="flex-1 min-w-0 mr-2">
                <p class="font-medium truncate">{{ item.name }}</p>
                <p class="text-sm text-secondary dark:text-dark-secondary">
                  Rp {{ formatRupiah(item.sell_price) }}
                </p>
              </div>
              <div class="flex items-center flex-shrink-0">
                <div class="flex items-center border rounded-md p-1">
                  <button @click="updateQuantity(item, -1)" class="px-2 font-medium">-</button>
                  <span class="w-24 text-center font-semibold">{{ item.quantity }} {{ item.satuan }}</span>
                  <button @click="updateQuantity(item, 1)" class="px-2 font-medium">+</button>
                </div>
                <button @click="cart.splice(index, 1)" class="ml-3 text-gray-400 hover:text-red-500">
                  <Trash2 class="w-5 h-5"/>
                </button>
              </div>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex justify-between items-center text-2xl font-bold mb-4">
              <span>Total</span>
              <span>Rp {{ totalRupiah }}</span>
            </div>
            <button @click="openPaymentModal" :disabled="isCartEmpty" class="w-full p-3 bg-primary text-white rounded-md disabled:opacity-50 font-semibold text-lg">
              Lanjutkan Pembayaran
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isPaymentModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl">
      <h2 class="text-xl font-bold mb-4">Detail Pembayaran</h2>
      
      <div class="space-y-4">
        <div>
          <label for="customerNameModal" class="block text-sm font-medium">Nama Pelanggan</label>
          <input v-model="paymentData.customer_name" id="customerNameModal" type="text" placeholder="Nama Pelanggan (Opsional)" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background" />
        </div>

        <div class="flex items-center justify-between p-3 bg-background dark:bg-dark-background rounded-lg">
          <label for="is_dp_toggle_modal" class="font-medium">Bayar DP (Uang Muka)?</label>
          <button id="is_dp_toggle_modal" @click="paymentData.is_dp = !paymentData.is_dp" :class="paymentData.is_dp ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
            <span :class="paymentData.is_dp ? 'translate-x-6' : 'translate-x-1'" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
          </button>
        </div>

        <div v-if="paymentData.is_dp" class="space-y-4">
          <div>
            <label for="dpAmountModal" class="block text-sm font-medium">Jumlah DP</label>
            <CurrencyInput v-model="paymentData.amount_paid" id="dpAmountModal" ref="dpInputRef" />
          </div>
          <div class="flex justify-between text-lg font-bold">
            <span>Sisa Tagihan:</span>
            <span>Rp {{ remainingBalanceRupiah }}</span>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Metode Pembayaran</label>
            <div class="mt-2 grid grid-cols-3 gap-2">
              <button 
                type="button" 
                @click="paymentData.payment_method = 'Tunai'" 
                :class="paymentData.payment_method === 'Tunai' ? 'bg-primary text-white ring-2 ring-primary' : 'bg-gray-200 dark:bg-gray-700'"
                class="p-3 rounded-md font-semibold text-center transition-colors"
              >
                Tunai
              </button>
              <button 
                type="button" 
                @click="paymentData.payment_method = 'QRIS'"
                :class="paymentData.payment_method === 'QRIS' ? 'bg-primary text-white ring-2 ring-primary' : 'bg-gray-200 dark:bg-gray-700'"
                class="p-3 rounded-md font-semibold text-center transition-colors"
              >
                QRIS
              </button>
              <button 
                type="button" 
                @click="paymentData.payment_method = 'Transfer'"
                :class="paymentData.payment_method === 'Transfer' ? 'bg-primary text-white ring-2 ring-primary' : 'bg-gray-200 dark:bg-gray-700'"
                class="p-3 rounded-md font-semibold text-center transition-colors"
              >
                Transfer
              </button>
            </div>
          </div>
          <div v-if="paymentData.payment_method === 'Tunai'">
            <label for="cashModal" class="block text-sm font-medium">Uang Diterima</label>
            <CurrencyInput v-model="cashReceived" id="cashModal" ref="cashInputRef" />
            <div class="mt-2 flex justify-between text-lg font-bold"><span>Kembalian:</span> <span>Rp {{ changeRupiah }}</span></div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-4">
        <button type="button" @click="isPaymentModalOpen = false" class="px-4 py-2 border rounded-md">Batal</button>
        <button @click="processPayment" :disabled="isConfirmDisabled" class="px-4 py-2 bg-primary dark:bg-dark-primary dark:text-dark-surface text-white rounded-md disabled:opacity-50">
          <span v-if="paymentLoading">Memproses...</span>
          <span v-else>Konfirmasi Pembayaran</span>
        </button>
      </div>
    </div>
  </div>

  <div v-if="lastTransaction" class="print-area" :class="{ 'thermal-print-format': storeInfo.receipt_format === 'thermal_58mm' }">
    <component 
      :is="receiptComponent"
      :transaction="lastTransaction" 
      :storeInfo="storeInfo" 
    />
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .print-area, .print-area * {
    visibility: visible;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Aturan default adalah A5 Landscape */
  @page {
    size: A5 landscape;
    margin: 1cm;
  }

  /* Aturan khusus JIKA format thermal dipilih */
  .thermal-print-format {
    @page {
      size: 58mm 210mm;
      margin: 0;
    }
  }
}
</style>

<script setup>
import { ref, computed, onMounted, nextTick, reactive, shallowRef } from 'vue';
import { useProductStore } from '../stores/product';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { Trash2, LoaderCircle } from 'lucide-vue-next';
import { useToast } from "vue-toastification";
import Struk from '../components/Struk.vue';
import StrukA5 from '../components/StrukA5.vue';
import CurrencyInput from '../components/CurrencyInput.vue';

const toast = useToast();
const productStore = useProductStore();
const { allProducts: products, loading } = storeToRefs(productStore);

const searchQuery = ref('');
const cart = ref([]);
const paymentLoading = ref(false);
const lastTransaction = ref(null);
const storeInfo = reactive({
  receipt_format: 'thermal_58mm'
});

const isPaymentModalOpen = ref(false);
const paymentData = reactive({
  customer_name: '',
  is_dp: false,
  payment_method: 'Tunai',
  amount_paid: 0,
});
const cashReceived = ref(0);
const cashInputRef = ref(null);
const dpInputRef = ref(null);

const totalNumber = computed(() => cart.value.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0));
const totalRupiah = computed(() => formatRupiah(totalNumber.value));
const isCartEmpty = computed(() => cart.value.length === 0);

const changeRupiah = computed(() => {
  if (!paymentData.is_dp && paymentData.payment_method === 'Tunai' && cashReceived.value >= totalNumber.value) {
    return formatRupiah(cashReceived.value - totalNumber.value);
  }
  return '0';
});

const remainingBalanceRupiah = computed(() => {
  if (paymentData.is_dp && paymentData.amount_paid > 0 && paymentData.amount_paid < totalNumber.value) {
    return formatRupiah(totalNumber.value - paymentData.amount_paid);
  }
  return formatRupiah(totalNumber.value);
});

const isConfirmDisabled = computed(() => {
  if (paymentLoading.value) return true;
  if (paymentData.is_dp) {
    return !paymentData.amount_paid || paymentData.amount_paid <= 0 || paymentData.amount_paid >= totalNumber.value;
  }
  if (paymentData.payment_method === 'Tunai') {
    return !cashReceived.value || cashReceived.value < totalNumber.value;
  }
  return false;
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

// PERBAIKAN UTAMA: Hapus shallowRef di sini
const receiptComponent = computed(() => {
  return storeInfo.receipt_format === 'a5_landscape' ? StrukA5 : Struk;
});

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return Number(number).toLocaleString('id-ID');
};

onMounted(async () => {
  productStore.fetchAllProducts();
  try {
    const response = await axios.get('/settings');
    Object.assign(storeInfo, response.data);
  } catch (error) {
    console.error("Gagal memuat info toko untuk struk");
  }
});

function addToCart(product) {
  if (product.stock <= 0) {
    toast.warning("Stok produk habis!");
    return;
  }
  const cartItem = cart.value.find(item => item.id === product.id);
  if (cartItem) {
    if (cartItem.quantity < product.stock) {
      cartItem.quantity++;
    } else {
      toast.info(`Stok maksimal untuk ${product.name} telah tercapai.`);
    }
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
}

function updateQuantity(item, amount) {
  const newQuantity = item.quantity + amount;
  if (newQuantity > 0 && newQuantity <= item.stock) {
    item.quantity = newQuantity;
  } else if (newQuantity <= 0) {
    const itemIndex = cart.value.findIndex(cartItem => cartItem.id === item.id);
    if (itemIndex > -1) {
      cart.value.splice(itemIndex, 1);
    }
  } else {
    toast.info(`Stok maksimal untuk ${item.name} adalah ${item.stock}.`);
    item.quantity = item.stock;
  }
}

const openPaymentModal = () => {
  if (isCartEmpty.value) return;
  paymentData.customer_name = '';
  paymentData.is_dp = false;
  paymentData.payment_method = 'Tunai';
  paymentData.amount_paid = 0;
  cashReceived.value = 0;
  isPaymentModalOpen.value = true;
};

const printReceipt = async (transactionData) => {
  lastTransaction.value = transactionData;
  await nextTick();
  window.print();
  lastTransaction.value = null;
}

const processPayment = async () => {
  if (isCartEmpty.value) return;
  paymentLoading.value = true;
  
  const payload = {
    items: cart.value.map(item => ({ id: item.id, quantity: item.quantity })),
    customer_name: paymentData.customer_name,
    is_dp: paymentData.is_dp,
  };

  if (paymentData.is_dp) {
    payload.payment_method = 'DP';
    payload.amount_paid = paymentData.amount_paid;
  } else {
    payload.payment_method = paymentData.payment_method;
    payload.amount_paid = payload.payment_method === 'Tunai' ? cashReceived.value : totalNumber.value;
  }

  try {
    const response = await axios.post('/transactions', payload);
    isPaymentModalOpen.value = false;
    toast.success('Transaksi berhasil!');
    
    await printReceipt(response.data);
    
    cart.value = [];
    await productStore.fetchAllProducts();
  } catch (error) {
    toast.error(`Transaksi gagal: ${error.response?.data?.message || error.message}`);
  } finally {
    paymentLoading.value = false;
  }
};
</script>