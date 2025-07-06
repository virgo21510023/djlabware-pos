<template>
  <div class="bg-gray-200 dark:bg-gray-900 min-h-screen p-8 print:bg-white">
    <div class="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden">
      <button @click="goBack" class="flex items-center text-secondary hover:text-primary">
        <ArrowLeft class="w-5 h-5 mr-2" />
        Kembali ke Daftar PO
      </button>
      <button @click="downloadPDF" :disabled="isGeneratingPDF" class="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center disabled:opacity-50">
          <Download class="w-5 h-5 mr-2" />
          <span v-if="isGeneratingPDF">Membuat PDF...</span>
          <span v-else>Unduh PDF</span>
      </button>
    </div>

    <div v-if="loading" class="text-center bg-white p-12 max-w-4xl mx-auto">Memuat data...</div>
    <div v-else-if="purchaseOrder" id="printable-po" class="bg-white p-12 max-w-4xl mx-auto shadow-lg text-black">
        <div class="flex justify-between items-start">
            <div class="w-32">
                <img v-if="storeInfo.store_logo" :src="backendUrl + storeInfo.store_logo" alt="Logo Toko" class="max-h-20 object-contain">
            </div>
            <div class="text-right">
                <h1 class="text-2xl font-bold text-black">{{ storeInfo.store_name || 'DJLABWARE' }}</h1>
                <p class="text-xs text-gray-600">{{ storeInfo.store_address }}</p>
                <p class="text-xs text-gray-600">{{ storeInfo.store_phone }}</p>
            </div>
        </div>
        <hr class="my-6 border-black">

        <h1 class="text-3xl font-bold text-center uppercase mb-8">PURCHASE ORDER</h1>
        
        <div class="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
                <p class="text-gray-500">KEPADA YTH:</p>
                <p class="font-semibold text-base">{{ purchaseOrder.supplier_name }}</p>
            </div>
            <table class="text-sm">
              <tbody>
              <tr>
                <td class="pr-4">No. PO</td>
                <td class="font-semibold">: {{ purchaseOrder.po_number }}</td>
              </tr>
              <tr>
                <td class="pr-4">Tanggal Pesan</td>
                <td class="font-semibold">: {{ formatTanggal(purchaseOrder.order_date) }}</td>
              </tr>
              <tr v-if="purchaseOrder.expected_delivery_date">
                <td class="pr-4">Perkiraan Tiba</td>
                <td class="font-semibold">: {{ formatTanggal(purchaseOrder.expected_delivery_date) }}</td>
              </tr>
              </tbody>
            </table>
        </div>

        <table class="w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-2 text-left font-semibold w-[5%]">NO</th>
                    <th class="p-2 text-left font-semibold w-[25%]">NAMA BARANG</th>
                    <th class="p-2 text-left font-semibold w-[15%]">MERK/KATALOG</th>
                    <th class="p-2 text-right font-semibold w-[15%]">QTY</th>
                    <th class="p-2 text-right font-semibold w-[15%]">HARGA SATUAN</th>
                    <th class="p-2 text-right font-semibold w-[15%]">SUBTOTAL</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in purchaseOrder.items" :key="item.id" class="border-b">
                    <td class="p-2 text-center align-top">{{ index + 1 }}</td>
                    <td class="p-2 align-top">{{ item.Product.name }}</td>
                    <td class="p-2 align-top">{{ item.Product.merk }}</td>
                    <td class="p-2 text-right align-top">{{ item.quantity_ordered }} {{ item.Product.satuan }}</td>
                    <td class="p-2 text-right align-top">{{ formatRupiah(item.estimated_price) }}</td>
                    <td class="p-2 text-right align-top">{{ formatRupiah(item.quantity_ordered * item.estimated_price) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="mt-8 grid grid-cols-2">
            <div class="text-sm pr-8">
                <p class="font-bold">Catatan:</p>
                <p v-if="purchaseOrder.notes" class="italic whitespace-pre-wrap">{{ purchaseOrder.notes }}</p>
                <p v-else class="italic text-gray-500">Tidak ada catatan.</p>
            </div>
            <div class="text-sm">
                <div class="flex justify-between mb-2"><span class="font-medium">Subtotal</span> <span class="font-semibold">{{ formatRupiah(purchaseOrder.subtotal) }}</span></div>
                <div v-if="purchaseOrder.discount_percentage > 0" class="flex justify-between mb-2 text-red-600"><span class="font-medium">Diskon ({{ purchaseOrder.discount_percentage }}%)</span> <span>-{{ formatRupiah(purchaseOrder.subtotal * purchaseOrder.discount_percentage / 100) }}</span></div>
                <div v-if="purchaseOrder.vat_percentage > 0" class="flex justify-between mb-2"><span class="font-medium">PPN ({{ purchaseOrder.vat_percentage }}%)</span> <span>{{ formatRupiah((purchaseOrder.subtotal - (purchaseOrder.subtotal * purchaseOrder.discount_percentage / 100)) * purchaseOrder.vat_percentage / 100) }}</span></div>
                <hr class="my-2 border-black">
                <div class="flex justify-between font-bold text-lg"><span class="">GRAND TOTAL</span> <span>{{ formatRupiah(purchaseOrder.grand_total) }}</span></div>
            </div>
        </div>

        <div class="pt-24 mt-auto grid grid-cols-2 gap-4 text-center text-sm">
            <div>
                <p class="mb-16">Supplier,</p>
                <p class="font-semibold">(___________________)</p>
                <p>Nama Jelas & Cap</p>
            </div>
            <div>
                <p class="mb-16">Hormat Kami,</p>
                <p class="font-semibold">( {{ authStore.user?.name || '___________________' }} )</p>
                <p>{{ authStore.user?.role || 'Bag. Pembelian' }}</p>
            </div>
        </div>
    </div>
  </div>
</template>

<style>
@media print {
  .print-hidden { display: none; }
  body * { visibility: hidden; }
  #printable-po, #printable-po * { visibility: visible; }
  #printable-po {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 1.5rem;
    box-shadow: none;
    border: none;
  }
}
</style>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const purchaseOrder = ref(null);
const loading = ref(true);
const isGeneratingPDF = ref(false);
const storeInfo = reactive({});
const backendUrl = 'http://localhost:5000';

const formatRupiah = (number) => {
  return "Rp " + Number(number || 0).toLocaleString('id-ID');
};

const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMMM yyyy", { locale: id });
};

onMounted(async () => {
  try {
    const poId = route.params.id;
    const [poRes, settingsRes] = await Promise.all([
      axios.get(`/purchase-orders/${poId}`),
      axios.get('/settings')
    ]);
    purchaseOrder.value = poRes.data;
    Object.assign(storeInfo, settingsRes.data);
  } catch (error) {
    alert('Gagal memuat data Purchase Order.');
  } finally {
    loading.value = false;
  }
});

const downloadPDF = () => {
  const poElement = document.getElementById('printable-po');
  if (!poElement) return;
  isGeneratingPDF.value = true;
  html2canvas(poElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    .then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`po-${purchaseOrder.value.po_number}.pdf`);
    }).finally(() => {
      isGeneratingPDF.value = false;
    });
};

const goBack = () => {
  router.push('/purchase-orders');
};
</script>