<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <button @click="goBack" class="flex items-center text-secondary hover:text-primary">
        <ArrowLeft class="w-5 h-5 mr-2" />
        Kembali ke Daftar Invoice
      </button>
      <div class="flex items-center gap-2">
        <button @click="downloadPDF" :disabled="isGeneratingPDF || !invoice"
          class="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md flex items-center disabled:opacity-50">
          <Download class="w-5 h-5 mr-2" />
          <span v-if="isGeneratingPDF">Membuat PDF...</span>
          <span v-else>Unduh PDF</span>
        </button>
        <button v-if="invoice && invoice.status !== 'Lunas'" @click="openDoModal"
          class="bg-orange-500 text-white font-bold px-4 py-2 rounded-md flex items-center">
          <Truck class="w-5 h-5 mr-2" />
          Buat Surat Jalan
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center p-10">Memuat data invoice...</div>
    <div v-else-if="invoice" id="printable-invoice"
      class="bg-white p-8 max-w-4xl mx-auto shadow-lg text-black flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div class="w-32">
          <img v-if="storeInfo.store_logo" :src="backendUrl + storeInfo.store_logo" alt="Logo Toko" class="max-h-20">
        </div>
        <div class="text-right">
          <h1 class="text-2xl font-bold text-black">{{ storeInfo.store_name || 'DJLABWARE' }}</h1>
          <p class="text-xs text-gray-600">{{ storeInfo.store_address }}</p>
          <p class="text-xs text-gray-600">{{ storeInfo.store_phone }}</p>
        </div>
      </div>
      <hr class="mb-6 border-gray-400">
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
              <th class="p-2 text-left font-semibold">Merk</th>
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
          <div class="text-sm text-gray-800 space-y-1">
            <div class="flex justify-between"><span class="font-medium">Subtotal</span> <span>{{
              formatRupiah(invoice.subtotal) }}</span></div>
            <div v-if="invoice.discount_percentage > 0" class="flex justify-between text-red-600"><span
                class="font-medium">Diskon ({{ invoice.discount_percentage }}%)</span> <span>-{{
                  formatRupiah(invoice.subtotal * invoice.discount_percentage / 100) }}</span></div>
            <div v-if="invoice.shipping_cost > 0" class="flex justify-between"><span class="font-medium">Ongkir</span>
              <span>{{ formatRupiah(invoice.shipping_cost) }}</span>
            </div>
            <div v-if="invoice.vat_amount > 0" class="flex justify-between"><span class="font-medium">PPN (11%)</span>
              <span>{{ formatRupiah(invoice.vat_amount) }}</span>
            </div>
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
    <div v-else class="text-center p-10">Gagal memuat data atau invoice tidak ditemukan.</div>

    <div v-if="invoice" class="mt-8 max-w-4xl mx-auto">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button @click="activeTab = 'pembayaran'"
            :class="[activeTab === 'pembayaran' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Riwayat Pembayaran
          </button>
          <button @click="activeTab = 'pengiriman'"
            :class="[activeTab === 'pengiriman' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Riwayat Pengiriman
          </button>
        </nav>
      </div>
      <div class="mt-4 bg-surface dark:bg-dark-surface p-4 rounded-lg shadow min-h-[10rem]">
        <div v-if="activeTab === 'pembayaran'">
          <ul v-if="invoice.payments && invoice.payments.length > 0" class="space-y-2">
            <li v-for="payment in invoice.payments" :key="payment.id"
              class="flex justify-between p-2 rounded-md bg-background dark:bg-dark-background">
              <span>{{ formatTanggalLengkap(payment.payment_date) }}</span>
              <span class="font-semibold">Rp {{ formatRupiah(payment.amount) }}</span>
            </li>
          </ul>
          <p v-else class="text-secondary">Belum ada riwayat pembayaran.</p>
          <button v-if="invoice && invoice.status !== 'Lunas'" @click="openPaymentModal"
            class="mt-4 bg-green-600 text-white font-bold px-4 py-2 rounded-md text-sm">
            + Catat Pembayaran
          </button>
        </div>
        <div v-if="activeTab === 'pengiriman'">
          <ul v-if="deliveryOrders.length > 0" class="space-y-2">
            <li v-for="doItem in deliveryOrders" :key="doItem.id"
              class="flex justify-between p-2 rounded-md bg-background dark:bg-dark-background items-center">
              <div>
                <span class="font-semibold">{{ doItem.do_number }}</span>
                <span class="text-sm text-secondary ml-4">{{ doItem.status }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span>{{ formatTanggal(doItem.delivery_date) }}</span>
                <button @click="printDo(doItem.id)" class="text-primary hover:text-primary/80 text-sm font-semibold">
                  Cetak
                </button>
              </div>
            </li>
          </ul>
          <p v-else class="text-secondary">Belum ada riwayat pengiriman.</p>
        </div>
      </div>
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

    <div v-if="isDoModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-2xl shadow-xl">
        <h2 class="text-xl font-bold mb-4">Buat Surat Jalan Baru</h2>
        <form @submit.prevent="handleCreateDo">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <input v-model="newDoData.recipient_name" placeholder="Nama Penerima" class="p-2 border rounded-md">
            <input v-model="newDoData.delivery_date" type="date" class="p-2 border rounded-md">
            <input v-model="newDoData.driver_name" placeholder="Nama Pengemudi" class="p-2 border rounded-md">
            <input v-model="newDoData.vehicle_number" placeholder="No. Kendaraan" class="p-2 border rounded-md">
            <textarea v-model="newDoData.shipping_address" placeholder="Alamat Pengiriman" rows="2"
              class="col-span-2 p-2 border rounded-md"></textarea>
          </div>
          <h3 class="font-bold my-2">Item untuk Dikirim:</h3>
          <div class="max-h-64 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-gray-100 dark:bg-gray-800">
                <tr class="border-b">
                  <th class="py-2 text-left">Produk</th>
                  <th class="py-2 text-right">Dipesan</th>
                  <th class="py-2 text-right">Terkirim</th>
                  <th class="py-2 text-right">Sisa</th>
                  <th class="w-24 py-2 text-right">Qty Kirim</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in newDoData.items_to_ship" :key="item.invoice_item_id" class="border-b">
                  <td>{{ item.product_name }}</td>
                  <td class="text-right">{{ item.quantity_ordered }}</td>
                  <td class="text-right">{{ item.total_shipped }}</td>
                  <td class="text-right font-bold">{{ item.quantity_remaining }}</td>
                  <td class="p-1"><input v-model.number="item.quantity_shipped" type="number" min="0"
                      :max="item.quantity_remaining" class="w-full text-right p-1 border rounded-md"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="isDoModalOpen = false" class="px-4 py-2 border rounded-md">Batal</button>
            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-md">Buat Surat Jalan</button>
          </div>
        </form>
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
import { ArrowLeft, Printer, DollarSign, Download, Truck } from 'lucide-vue-next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from "vue-toastification";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const backendUrl = 'http://localhost:5000';

const invoice = ref(null);
const loading = ref(true);
const terbilangText = ref('');
const storeInfo = reactive({});
const isGeneratingPDF = ref(false);

const activeTab = ref('pembayaran');
const deliveryOrders = ref([]);
const isDoModalOpen = ref(false);
const newDoData = reactive({
  invoice_id: null,
  delivery_date: new Date().toISOString().split('T')[0],
  recipient_name: '',
  shipping_address: '',
  vehicle_number: '',
  driver_name: '',
  notes: '',
  items_to_ship: []
});

const isPaymentModalOpen = ref(false);
const paymentAmount = ref(0);

const formatRupiah = (number) => {
  return Number(number || 0).toLocaleString('id-ID');
};

const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMMM yyyy", { locale: id });
};
const formatTanggalLengkap = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: id });
};

const fetchInvoiceDetail = async () => {
  loading.value = true;
  invoice.value = null;
  try {
    const invoiceId = route.params.id;
    const [invoiceRes, settingsRes, doRes] = await Promise.all([
      axios.get(`/invoices/${invoiceId}`),
      axios.get('/settings'),
      axios.get(`/invoices/${invoiceId}/delivery-orders`)
    ]);

    invoice.value = invoiceRes.data;
    Object.assign(storeInfo, settingsRes.data);
    deliveryOrders.value = doRes.data;

    if (invoice.value && invoice.value.grand_total > 0) {
      const terbilangRes = await axios.get(`/utils/terbilang`, {
        params: { amount: invoice.value.grand_total }
      });
      terbilangText.value = terbilangRes.data.text;
    }
  } catch (error) {
    console.error("Gagal memuat detail invoice:", error);
    toast.error("Gagal memuat detail invoice.");
  } finally {
    loading.value = false;
  }
};

const printDo = (doId) => {
  const url = router.resolve({ name: 'Cetak Surat Jalan', params: { id: doId } }).href;
  window.open(url, '_blank');
};

onMounted(fetchInvoiceDetail);

const goBack = () => router.push('/invoices');

const downloadPDF = () => {
  const invoiceElement = document.getElementById('printable-invoice');
  if (!invoiceElement) return;
  isGeneratingPDF.value = true;
  html2canvas(invoiceElement, { scale: 2, useCORS: true })
    .then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.value.invoice_number}.pdf`);
      isGeneratingPDF.value = false;
    }).catch(err => {
      console.error("Gagal membuat PDF:", err);
      toast.error("Gagal membuat PDF.");
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
    return toast.info("Jumlah pembayaran harus lebih dari 0.");
  }
  if (paymentAmount.value > parseFloat(invoice.value.amount_due) + 0.01) {
    return toast.error("Jumlah bayar melebihi sisa tagihan.");
  }
  try {
    await axios.post(`/invoices/${invoice.value.id}/payments`, {
      amount: paymentAmount.value
    });
    toast.success('Pembayaran berhasil dicatat!');
    isPaymentModalOpen.value = false;
    fetchInvoiceDetail();
  } catch (error) {
    toast.error('Gagal mencatat pembayaran.');
  }
};

const openDoModal = () => {
  if (!invoice.value) return;
  newDoData.invoice_id = invoice.value.id;
  newDoData.recipient_name = invoice.value.customer_name;
  newDoData.items_to_ship = invoice.value.items.map(item => {
    const total_shipped = deliveryOrders.value
      .flatMap(d => d.items || []) // Pastikan d.items ada
      .filter(do_item => do_item.invoice_item_id === item.id)
      .reduce((sum, do_item) => sum + parseFloat(do_item.quantity_shipped), 0);

    return {
      invoice_item_id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity_ordered: item.quantity,
      total_shipped: total_shipped,
      quantity_remaining: item.quantity - total_shipped,
      quantity_shipped: 0
    }
  });
  isDoModalOpen.value = true;
};

const handleCreateDo = async () => {
  try {
    const payload = { ...newDoData };
    payload.items_to_ship = payload.items_to_ship.filter(item => item.quantity_shipped > 0);
    if (payload.items_to_ship.length === 0) {
      return toast.warning('Harap isi jumlah barang yang akan dikirim.');
    }
    await axios.post('/delivery-orders', payload);
    toast.success('Surat Jalan berhasil dibuat!');
    isDoModalOpen.value = false;
    fetchInvoiceDetail();
  } catch (error) {
    toast.error('Gagal membuat Surat Jalan.');
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