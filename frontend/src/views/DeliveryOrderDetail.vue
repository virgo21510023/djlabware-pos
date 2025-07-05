<template>
    <div class="bg-gray-200 min-h-screen p-8">
        <div class="max-w-4xl mx-auto mb-4 flex justify-end gap-2 print:hidden">
            <button @click="downloadPDF" :disabled="isGeneratingPDF"
                class="bg-blue-600 text-white px-4 py-2 rounded shadow">
                <span v-if="isGeneratingPDF">Membuat PDF...</span>
                <span v-else>Unduh PDF</span>
            </button>
            <button @click="window.print()" class="bg-gray-600 text-white px-4 py-2 rounded shadow">Cetak</button>
        </div>

        <div v-if="loading" class="text-center">Memuat data...</div>
        <div v-else-if="deliveryOrder" id="printable-do"
            class="bg-white p-8 max-w-4xl mx-auto shadow-lg text-black flex flex-col min-h-[27cm]">
            <div class="flex justify-between items-center mb-6">
                <div class="w-32">
                    <img v-if="storeInfo.store_logo" :src="backendUrl + storeInfo.store_logo" alt="Logo Toko"
                        class="max-h-20">
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
                    <p class="text-gray-800">{{ deliveryOrder.recipient_name }}</p>
                    <p class="text-gray-600 text-sm">{{ deliveryOrder.shipping_address }}</p>
                </div>
                <div class="text-right">
                    <h1 class="text-2xl font-bold uppercase text-gray-800">SURAT JALAN</h1>
                    <p class="text-gray-600"><strong>No:</strong> {{ deliveryOrder.do_number }}</p>
                    <p class="text-gray-600"><strong>Tanggal:</strong> {{ formatTanggal(deliveryOrder.delivery_date) }}
                    </p>
                    <p class="text-gray-600"><strong>Ref. Invoice:</strong> {{ deliveryOrder.Invoice.invoice_number }}
                    </p>
                </div>
            </div>

            <div class="flex-grow">
                <table class="w-full mb-6 text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="p-2 text-left font-semibold w-1/12">No.</th>
                            <th class="p-2 text-left font-semibold w-2/5">Nama Barang</th>
                            <th class="p-2 text-left font-semibold">Merk</th>
                            <th class="p-2 text-right font-semibold">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in deliveryOrder.items" :key="item.id" class="border-b">
                            <td class="p-2 text-center align-top">{{ index + 1 }}</td>
                            <td class="p-2 align-top">{{ item.product_name }}</td>
                            <td class="p-2 align-top">{{ item.Product?.merk || 'N/A' }}</td>
                            <td class="p-2 text-right align-top">{{ item.quantity_shipped }} {{ item.Product?.satuan }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex-shrink-0 pt-8 mt-auto grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                    <p class="mb-16">Penerima,</p>
                    <p class="font-semibold">(___________________)</p>
                    <p>Nama Jelas & Cap</p>
                </div>
                <div>
                    <p class="mb-16">Pengemudi,</p>
                    <p class="font-semibold">( {{ deliveryOrder.driver_name || '___________________' }} )</p>
                    <p>Nama Jelas</p>
                </div>
                <div>
                    <p class="mb-16">Hormat Kami,</p>
                    <p class="font-semibold">(___________________)</p>
                    <p>Bag. Gudang</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const route = useRoute();
const deliveryOrder = ref(null);
const loading = ref(true);
const isGeneratingPDF = ref(false);
const storeInfo = reactive({});

const backendUrl = 'http://localhost:5000';

const formatTanggal = (dateString) => format(new Date(dateString), "d MMMM yyyy", { locale: id });

onMounted(async () => {
    try {
        const doId = route.params.id;
        const [doRes, settingsRes] = await Promise.all([
            axios.get(`/delivery-orders/${doId}`),
            axios.get('/settings')
        ]);
        deliveryOrder.value = doRes.data;
        Object.assign(storeInfo, settingsRes.data);
    } catch (error) {
        alert('Gagal memuat data Surat Jalan.');
    } finally {
        loading.value = false;
    }
});

const downloadPDF = () => {
    const doElement = document.getElementById('printable-do');
    if (!doElement) return;
    isGeneratingPDF.value = true;
    html2canvas(doElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
        .then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`surat-jalan-${deliveryOrder.value.do_number}.pdf`);
        }).finally(() => {
            isGeneratingPDF.value = false;
        });
};
</script>