<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Daftar Invoice</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Lacak status semua invoice yang telah diterbitkan.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">No. Invoice</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Pelanggan</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Tgl. Invoice</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Jatuh Tempo</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase">Total</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase">Status</th>
              <th class="relative px-6 py-3"><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="7" class="text-center py-4">Memuat data...</td></tr>
            <tr v-else-if="invoices.length === 0"><td colspan="7" class="text-center py-4">Belum ada invoice yang dibuat.</td></tr>
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{{ invoice.invoice_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ invoice.customer_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatTanggal(invoice.invoice_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatTanggal(invoice.due_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">Rp {{ formatRupiah(invoice.grand_total) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="getStatusClass(invoice.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="viewInvoiceDetail(invoice.id)" class="text-primary hover:text-primary/80">Lihat Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const invoices = ref([]);
const loading = ref(false);

const fetchInvoices = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/invoices');
    invoices.value = res.data;
  } catch (error) {
    toast.error('Gagal mengambil daftar invoice');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInvoices);

const formatRupiah = (number) => Number(number || 0).toLocaleString('id-ID');
const formatTanggal = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), "d MMM yyyy", { locale: id });
};

const getStatusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === 'lunas') return 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-300';
  if (s === 'belum dibayar') return 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-300';
  if (s === 'dibayar sebagian') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const viewInvoiceDetail = (invoiceId) => {
  router.push(`/invoices/${invoiceId}`);
};
</script>