<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Pengaturan</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Atur informasi toko dan preferensi aplikasi.</p>

    <form @submit.prevent="saveSettings" class="mt-6 max-w-2xl mx-auto space-y-6">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-4">
        <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold">Logo Perusahaan</h3>
          <p class="text-sm text-secondary dark:text-dark-secondary mb-4">Logo ini akan tampil di semua dokumen.</p>
          <div class="flex items-center gap-6">
            <div
              class="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
              <img v-if="logoPreviewUrl || settings.store_logo"
                :src="logoPreviewUrl || backendUrl + settings.store_logo" alt="Logo"
                class="max-w-full max-h-full object-contain">
              <span v-else class="text-xs text-gray-500">Belum ada logo</span>
            </div>
            <div class="flex-grow">
              <label for="logo-upload"
                class="cursor-pointer bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-md">
                Pilih Gambar
              </label>
              <input id="logo-upload" type="file" class="hidden" @change="handleFileChange"
                accept="image/png, image/jpeg">
              <p v-if="selectedFile" class="text-sm mt-2">File dipilih: {{ selectedFile.name }}</p>
              <button v-if="selectedFile" @click="uploadLogo"
                class="mt-2 bg-primary text-white font-bold py-2 px-4 rounded-md">
                Simpan Logo
              </button>
            </div>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-bold">Info Toko</h3>
          <p class="text-sm text-secondary dark:text-dark-secondary mb-3">Informasi ini akan ditampilkan pada struk &
            invoice.</p>
          <div class="space-y-3">
            <div>
              <label for="storeName" class="block text-sm font-medium">Nama Toko</label>
              <input v-model="settings.store_name" id="storeName" type="text" class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div>
              <label for="storeAddress" class="block text-sm font-medium">Alamat Toko</label>
              <textarea v-model="settings.store_address" id="storeAddress" rows="3"
                class="mt-1 w-full p-2 border rounded-md"></textarea>
            </div>
            <div>
              <label for="storePhone" class="block text-sm font-medium">No. Telepon Toko</label>
              <input v-model="settings.store_phone" id="storePhone" type="text"
                class="mt-1 w-full p-2 border rounded-md">
            </div>
          </div>
        </div>
        <hr class="my-6">

        <div>
          <h3 class="text-lg font-bold">Informasi Rekening Bank</h3>
          <p class="text-sm text-secondary dark:text-dark-secondary mb-3">Akan ditampilkan pada dokumen Invoice.</p>
          <div class="space-y-3">
            <div>
              <label for="bankName" class="block text-sm font-medium">Nama Bank</label>
              <input v-model="settings.bank_name" id="bankName" type="text" placeholder="Contoh: BCA"
                class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div>
              <label for="bankAccount" class="block text-sm font-medium">Nomor Rekening</label>
              <input v-model="settings.bank_account" id="bankAccount" type="text" placeholder="Contoh: 1234567890"
                class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div>
              <label for="bankBeneficiary" class="block text-sm font-medium">Atas Nama</label>
              <input v-model="settings.bank_beneficiary" id="bankBeneficiary" type="text"
                placeholder="Contoh: PT. DJLABWARE" class="mt-1 w-full p-2 border rounded-md">
            </div>
          </div>
        </div>

        <hr class="my-6">

        <div>
          <h3 class="text-lg font-bold">Catatan Dokumen</h3>
          <p class="text-sm text-secondary dark:text-dark-secondary mb-3">Akan tampil di bagian bawah struk & penawaran.
          </p>
          <div class="mt-2">
            <textarea v-model="settings.store_note" id="storeNote" rows="3"
              placeholder="Contoh: Barang yang sudah dibeli tidak dapat dikembalikan."
              class="w-full p-2 border rounded-md"></textarea>
          </div>
        </div>

      </div>

      <div class="flex justify-end">
        <button type="submit" class="bg-primary text-white font-bold py-2 px-6 rounded-md">
          Simpan Pengaturan
        </button>
      </div>
    </form>

    <div class="mt-8 max-w-2xl mx-auto">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h3 class="text-lg font-bold">Tema Tampilan</h3>
        <p class="text-sm text-secondary dark:text-dark-secondary mb-4">Pilih tema favorit Anda.</p>
        <div class="flex items-center space-x-8">
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="light"
              class="form-radio text-primary focus:ring-primary">
            <span class="ml-2">Light</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="dark" class="form-radio text-primary focus:ring-primary">
            <span class="ml-2">Dark</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="system"
              class="form-radio text-primary focus:ring-primary">
            <span class="ml-2">Sistem</span>
          </label>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useToast } from "vue-toastification";

const toast = useToast();

const authStore = useAuthStore();
const backendUrl = 'http://localhost:5000'; // URL backend Anda

const settings = reactive({
  store_logo: '', // Tambahkan properti untuk logo
  store_name: '',
  store_address: '',
  store_phone: '',
  store_note: '',
  bank_name: '',
  bank_account: '',
  bank_beneficiary: ''
});

// --- Logika untuk Tema ---
const selectedTheme = ref(localStorage.getItem('theme') || 'system');

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
};

watch(selectedTheme, (newTheme) => {
  applyTheme(newTheme);
});


// --- Logika untuk Pengaturan Toko ---
onMounted(async () => {
  applyTheme(selectedTheme.value); // Terapkan tema saat awal
  if (authStore.isAdmin) {
    try {
      const response = await axios.get('/settings');
      Object.assign(settings, response.data);
    } catch (error) {
      console.error("Gagal memuat pengaturan:", error);
    }
  }
});

// State baru untuk proses unggah
const selectedFile = ref(null);
const logoPreviewUrl = ref('');

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    // Buat URL sementara untuk pratinjau
    logoPreviewUrl.value = URL.createObjectURL(file);
  }
};

const uploadLogo = async () => {
  if (!selectedFile.value) {
    return toast.error('Pilih file terlebih dahulu!');
  }

  const formData = new FormData();
  formData.append('logo', selectedFile.value);

  try {
    const response = await axios.post('/settings/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    settings.store_logo = response.data.filePath; // Update path logo
    selectedFile.value = null; // Reset pilihan file
    logoPreviewUrl.value = ''; // Reset pratinjau
    toast.success(response.data.message);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal mengunggah logo.');
  }
};


const saveSettings = async () => {
  try {
    await axios.put('/settings', settings);
    // 3. Ganti alert dengan toast.success
    toast.success('Pengaturan berhasil disimpan!');
  } catch (error) {
    // 4. Ganti alert dengan toast.error
    toast.error('Gagal menyimpan pengaturan.');
  }
};
</script>