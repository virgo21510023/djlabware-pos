<template>
    <div class="struk-a5-container text-black bg-white p-6">

        <div class="flex justify-between items-start mb-4">
            <div class="w-32">
                <img v-if="storeInfo.store_logo" :src="backendUrl + storeInfo.store_logo" alt="Logo"
                    class="max-h-16 object-contain">
            </div>
            <div class="text-right">
                <h2 class="text-lg font-bold">{{ storeInfo.store_name || 'djlabware POS' }}</h2>
                <p class="text-xs">{{ storeInfo.store_address }}</p>
                <p class="text-xs">{{ storeInfo.store_phone }}</p>
            </div>
        </div>
        <hr class="my-3 border-dashed border-black">

        <div class="text-xs grid grid-cols-2 mb-3">
            <div>
                <p>No: {{ transaction.invoice_number }}</p>
                <p>Kasir: {{ transaction.User.name }}</p>
            </div>
            <div class="text-right">
                <p>Tanggal: {{ formatTanggal(transaction.transaction_date) }}</p>
                <p>Pelanggan: {{ transaction.customer_name }}</p>
            </div>
        </div>
        <hr class="my-3 border-dashed border-black">

        <table class="w-full text-xs">
            <thead class="bg-gray-100">
                <tr class="border-b-2 border-dashed border-black">
                    <th class="p-1 text-left font-semibold w-[40%]">Nama Barang</th>
                    <th class="p-1 text-left font-semibold w-[20%]">Merk/Katalog</th>
                    <th class="p-1 text-right font-semibold">Qty</th>
                    <th class="p-1 text-right font-semibold">Harga</th>
                    <th class="p-1 text-right font-semibold">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in transaction.TransactionItems" :key="item.id">
                    <td class="p-1 align-top">{{ item.Product.name }}</td>
                    <td class="p-1 align-top">{{ item.Product.merk }}</td>
                    <td class="p-1 align-top text-right">{{ item.quantity }} {{ item.Product.satuan }}</td>
                    <td class="p-1 align-top text-right">{{ formatRupiah(item.price_per_item) }}</td>
                    <td class="p-1 align-top text-right">{{ formatRupiah(item.quantity * item.price_per_item) }}</td>
                </tr>
            </tbody>
        </table>
        <hr class="my-3 border-dashed border-black">

        <div class="text-xs w-1/2 ml-auto space-y-1">
            <div class="flex justify-between font-medium">
                <span>Total</span>
                <span class="font-semibold">{{ formatRupiah(transaction.total_amount) }}</span>
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

        <div class="mt-2 text-xs">
            <p class="font-bold">PERNYATAAN PENGGUNAAN BAHAN</p>
            <p class="italic">
                Dengan menerima barang-barang yang tercantum di atas, saya, <strong>{{ transaction.customer_name ||
                    'Pembeli' }}</strong>, menyatakan bahwa seluruh bahan kimia yang dibeli akan digunakan secara
                bertanggung jawab untuk tujuan penelitian, pendidikan, atau kegiatan legal lainnya. Saya membebaskan
                <strong>{{ storeInfo.store_name || 'Toko' }}</strong> dari segala tuntutan hukum atau penyalahgunaan
                yang mungkin timbul dari penggunaan bahan-bahan tersebut.
            </p>
        </div>

        <div class="text-xs text-center mt-2">
            <p v-if="storeInfo.store_note" class="italic">{{ storeInfo.store_note }}</p>
            <p class="mt-1">
                {{ transaction.status === 'Belum Lunas' ? 'Simpan struk ini untuk pelunasan.' : 'Terima kasih telah berbelanja!' }}
            </p>
        </div>
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