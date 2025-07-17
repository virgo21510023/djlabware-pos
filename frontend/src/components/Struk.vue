<template>
  <div class="struk-container">
    <div class="text-center">
      <img v-if="storeInfo.store_logo" :src="backendUrl + storeInfo.store_logo" alt="Logo" class="max-h-16 mx-auto mb-2">
      <h2 class="text-xl font-bold">{{ storeInfo.store_name || 'djlabware POS' }}</h2>
      <p class="text-xs">{{ storeInfo.store_address || 'Alamat Toko Anda' }}</p>
      <p class="text-xs">{{ storeInfo.store_phone || 'Kontak Toko Anda' }}</p>
    </div>
    <hr class="my-2 border-dashed border-black">
    <div class="text-xs">
      <p>No: {{ transaction.invoice_number }}</p>
      <p>Tgl: {{ formatTanggal(transaction.transaction_date) }}</p>
      <p>Kasir: {{ transaction.User.name }}</p>
      <p>Pelanggan: {{ transaction.customer_name }}</p>
    </div>
    <hr class="my-2 border-dashed border-black">
    <div>
      <div v-for="item in transaction.TransactionItems" :key="item.id" class="text-xs mb-1">
        <p class="font-medium">{{ item.Product.name }}</p>
        <div class="flex justify-between">
          <span>{{ item.quantity }} {{ item.Product.satuan }} x {{ formatRupiah(item.price_per_item) }}</span>
          <span>{{ formatRupiah(item.quantity * item.price_per_item) }}</span>
        </div>
      </div>
    </div>
    <hr class="my-2 border-dashed border-black">
    <div class="text-xs space-y-1">
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span>{{ formatRupiah(transaction.total_amount) }}</span>
      </div>
      <div v-if="transaction.payment_method === 'Tunai'" class="flex justify-between">
        <span>Tunai</span>
        <span>{{ formatRupiah(transaction.amount_paid) }}</span>
      </div>
      <div v-if="isChangeVisible" class="flex justify-between">
        <span>Kembali</span>
        <span>{{ formatRupiah(transaction.amount_paid - transaction.total_amount) }}</span>
      </div>
       <div v-if="transaction.status === 'Belum Lunas'">
        <div class="flex justify-between">
          <span>DP Dibayar</span>
          <span>{{ formatRupiah(transaction.amount_paid) }}</span>
        </div>
        <div class="flex justify-between font-bold">
          <span>Sisa Bayar</span>
          <span>{{ formatRupiah(transaction.remaining_amount) }}</span>
        </div>
      </div>
    </div>
    <hr class="my-2 border-dashed border-black">
    <div v-if="storeInfo.store_note" class="text-xs text-center my-2">
      <p>{{ storeInfo.store_note }}</p>
    </div>
    <p class="text-xs text-center mt-2">
      {{ transaction.status === 'Belum Lunas' ? 'Simpan struk ini untuk pelunasan.' : 'Terima kasih telah berbelanja!' }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

// Definisikan backendUrl untuk membangun path gambar
const backendUrl = 'http://localhost:5000';

const props = defineProps({
  transaction: Object,
  storeInfo: Object
});

const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');
const formatTanggal = (dateString) => format(new Date(dateString), "dd/MM/yy HH:mm");

const isChangeVisible = computed(() => {
  return props.transaction.payment_method === 'Tunai' && 
         props.transaction.status === 'Lunas' && 
         (props.transaction.amount_paid > props.transaction.total_amount);
});
</script>

<style scoped>
.struk-container {
  width: 58mm;
  padding: 3mm;
  font-family: 'Courier New', Courier, monospace;
  color: black;
  font-size: 8pt;
}
</style>