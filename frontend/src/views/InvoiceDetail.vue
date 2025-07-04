<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <button @click="goBack" class="flex items-center text-secondary hover:text-primary">
        <ArrowLeft class="w-5 h-5 mr-2" />
        Kembali ke Daftar Invoice
      </button>
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <button @click="downloadPDF" :disabled="isGeneratingPDF"
            class="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md flex items-center disabled:opacity-50">
            <Download class="w-5 h-5 mr-2" />
            <span v-if="isGeneratingPDF">Membuat PDF...</span>
            <span v-else>Unduh PDF</span>
          </button>
          <button v-if="invoice && invoice.status !== 'Lunas'" @click="openPaymentModal"
            class="bg-green-600 text-white font-bold px-4 py-2 rounded-md flex items-center">
            <DollarSign class="w-5 h-5 mr-2" />
            Catat Pembayaran
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center">Memuat data invoice...</div>
    <div v-else-if="invoice" id="printable-invoice" class="bg-white p-8 max-w-4xl mx-auto shadow-lg text-black flex flex-col">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-black">{{ storeInfo.store_name || 'DJLABWARE' }}</h1>
        <p class="text-sm text-gray-600">{{ storeInfo.store_address }}</p>
        <p class="text-sm text-gray-600">{{ storeInfo.store_phone }}</p>
      </div>
      <hr class="mb-6 border-gray-400">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h2 class="font-bold text-gray-700">Kepada Yth:</h2>
          <p class="text-gray-800">{{ invoice.customer_name }}</p>
        </div>
        <div class="text-right">
          <h1 class="text-2xl font-bold uppercase text-gray-800">{{ invoice.status === 'Belum Dibayar' ? 'PROFORMA INVOICE' : 'INVOICE' }}</h1>
          <p class="text-gray-600"><strong>No:</strong> {{ invoice.invoice_number }}</p>
          <p class="text-gray-600"><strong>Tanggal:</strong> {{ formatTanggal(invoice.invoice_date) }}</p>
          <p class="text-gray-600"><strong>Jatuh Tempo:</strong> {{ formatTanggal(invoice.due_date) }}</p>
        </div>
      </div>

      <div class="flex-grow">
        <table class="w-full mb-6 text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 text-left font-semibold w-2/5">Deskripsi</th>
              <th class="p-2 text-left font-semibold w-1/5">Merk</th>
              <th class="p-2 text-right font-semibold">Qty</th>
              <th class="p-2 text-right font-semibold">Harga Satuan</th>
              <th class="p-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in invoice.items" :key="item.id" class="border-b">
              <td class="p-2 align-top">{{ item.product_name }}</td>
              <td class="p-2 align-top">{{ item.Product?.merk || 'N/A' }}</td>
              <td class="p-2 text-right align-top">{{ item.quantity }} {{ item.Product?.satuan }}</td>
              <td class="p-2 text-right align-top">{{ formatRupiah(item.price) }}</td>
              <td class="p-2 text-right align-top">{{ formatRupiah(item.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex-shrink-0 pt-2 border-t-2 border-black mt-auto">
        <div class="grid grid-cols-2 gap-8">
          <div class="text-sm text-gray-700">
            <p class="font-bold">Terbilang:</p>
            <p class="italic">"{{ terbilangText }}"</p>
            <div class="mt-4">
              <p class="font-bold">Pembayaran ke:</p>
              <p>{{ storeInfo.bank_name || 'N/A' }}</p>
              <p>A/N: {{ storeInfo.bank_beneficiary || 'N/A' }}</p>
              <p>No. Rek: {{ storeInfo.bank_account || 'N/A' }}</p>
            </div>
          </div>
          <div class="text-sm text-gray-800">
            <div class="flex justify-between mb-1"><span class="font-medium">Subtotal</span> <span>{{
              formatRupiah(invoice.subtotal) }}</span></div>
            <div v-if="invoice.discount_percentage > 0" class="flex justify-between mb-1 text-red-600">
              <span class="font-medium">Diskon ({{ invoice.discount_percentage }}%)</span>
              <span>-{{ formatRupiah(invoice.subtotal * invoice.discount_percentage / 100) }}</span>
            </div>
            <div v-if="invoice.shipping_cost > 0" class="flex justify-between mb-1"><span
                class="font-medium">Ongkir</span> <span>{{ formatRupiah(invoice.shipping_cost) }}</span></div>
            <div v-if="invoice.vat_amount > 0" class="flex justify-between mb-1"><span class="font-medium">PPN
                (11%)</span> <span>{{ formatRupiah(invoice.vat_amount) }}</span></div>
            <hr class="my-2 border-black">
            <div class="flex justify-between font-bold text-lg"><span class="">GRAND TOTAL</span> <span>{{
              formatRupiah(invoice.grand_total) }}</span></div>
            <div class="flex justify-between"><span class="font-medium">Sudah Dibayar</span> <span>-{{
              formatRupiah(invoice.amount_paid) }}</span></div>
            <hr class="my-1">
            <div class="flex justify-between font-bold text-red-600 text-lg"><span class="">SISA TAGIHAN</span> <span>{{
              formatRupiah(invoice.amount_due) }}</span></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center">Gagal memuat data atau invoice tidak ditemukan.</div>
  </div>

  <div v-if="isPaymentModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-sm shadow-xl">
      <h2 class="text-xl font-bold mb-4">Catat Pembayaran</h2>
      <p class="text-sm font-mono mb-4">{{ invoice.invoice_number }}</p>
      <div class="my-4 p-3 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
        <div class="flex justify-between font-bold text-yellow-800 dark:text-yellow-200">
          <span>Sisa Tagihan:</span>
          <span>Rp {{ formatRupiah(invoice.amount_due) }}</span>
        </div>
      </div>
      <div>
        <label for="paymentAmount" class="block text-sm font-medium">Jumlah Pembayaran</label>
        <input v-model.number="paymentAmount" id="paymentAmount" type="number"
          class="mt-1 w-full p-2 text-xl border rounded-md" />
      </div>
      <div class="mt-6 flex justify-end space-x-4">
        <button @click="isPaymentModalOpen = false" type="button" class="px-4 py-2 border rounded-md">Batal</button>
        <button @click="handleRecordPayment" class="px-4 py-2 bg-primary text-white rounded-md">Simpan
          Pembayaran</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { ArrowLeft, Download, DollarSign } from 'lucide-vue-next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const route = useRoute();
const router = useRouter();

const invoice = ref(null);
const loading = ref(true);
const terbilangText = ref('');
const storeInfo = reactive({});

const isPaymentModalOpen = ref(false);
const paymentAmount = ref(0);
const isGeneratingPDF = ref(false);

const formatRupiah = (number) => {
  return Number(number || 0).toLocaleString('id-ID');
};

const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMMM yyyy", { locale: id });
};

const fetchInvoiceDetail = async () => {
  loading.value = true;
  try {
    const invoiceId = route.params.id;
    const [invoiceRes, settingsRes] = await Promise.all([
      axios.get(`/invoices/${invoiceId}`),
      axios.get('/settings')
    ]);
    
    invoice.value = invoiceRes.data;
    Object.assign(storeInfo, settingsRes.data);

    if (invoice.value && invoice.value.grand_total > 0) {
      const terbilangRes = await axios.get(`/utils/terbilang`, {
        params: { amount: invoice.value.grand_total }
      });
      terbilangText.value = terbilangRes.data.text;
    }

  } catch (error) {
    console.error("Gagal memuat detail invoice:", error);
    alert("Gagal memuat detail invoice.");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInvoiceDetail);

const goBack = () => {
  router.push('/invoices');
};

const downloadPDF = () => {
  const invoiceElement = document.getElementById('printable-invoice');
  if (!invoiceElement) return;

  isGeneratingPDF.value = true;

  html2canvas(invoiceElement, {
    scale: 2,
    useCORS: true,
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoice.value.invoice_number}.pdf`);
    
    isGeneratingPDF.value = false;
  }).catch(err => {
    console.error("Gagal membuat PDF:", err);
    alert("Gagal membuat PDF.");
    isGeneratingPDF.value = false;
  });
};

const openPaymentModal = () => {
  if (invoice.value) {
    paymentAmount.value = invoice.value.amount_due;
    isPaymentModalOpen.value = true;
  }
};

const handleRecordPayment = async () => {
  if (!paymentAmount.value || paymentAmount.value <= 0) {
    return alert("Jumlah pembayaran harus lebih dari 0.");
  }
  if (paymentAmount.value > parseFloat(invoice.value.amount_due) + 0.01) {
    return alert("Jumlah bayar melebihi sisa tagihan.");
  }
  
  try {
    await axios.post(`/invoices/${invoice.value.id}/payments`, {
      amount: paymentAmount.value
    });
    alert('Pembayaran berhasil dicatat!');
    isPaymentModalOpen.value = false;
    fetchInvoiceDetail(); // Ambil ulang data untuk refresh status
  } catch (error) {
    alert('Gagal mencatat pembayaran.');
  }
};
</script>

<style>
/* CSS untuk menyembunyikan elemen non-invoice saat mencetak */
@media print {
  body>#app>div {
    visibility: hidden;
  }

  #printable-invoice,
  #printable-invoice * {
    visibility: visible;
  }

  #printable-invoice {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 1rem 2rem 1rem 2rem;
    /* Kurangi padding atas dan bawah menjadi 1rem */
    box-shadow: none;
    border: none;
  }
}
</style>