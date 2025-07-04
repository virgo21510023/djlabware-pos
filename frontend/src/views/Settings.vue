<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Pengaturan</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Atur informasi toko dan preferensi aplikasi.</p>

    <form @submit.prevent="saveSettings" class="mt-6 max-w-2xl mx-auto space-y-6">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow space-y-4">
        
        <div>
          <h3 class="text-lg font-bold">Info Toko</h3>
          <p class="text-sm text-secondary dark:text-dark-secondary mb-3">Informasi ini akan ditampilkan pada struk & invoice.</p>
          <div class="space-y-3">
            <div>
              <label for="storeName" class="block text-sm font-medium">Nama Toko</label>
              <input v-model="settings.store_name" id="storeName" type="text" class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div>
              <label for="storeAddress" class="block text-sm font-medium">Alamat Toko</label>
              <textarea v-model="settings.store_address" id="storeAddress" rows="3" class="mt-1 w-full p-2 border rounded-md"></textarea>
            </div>
            <div>
              <label for="storePhone" class="block text-sm font-medium">No. Telepon Toko</label>
              <input v-model="settings.store_phone" id="storePhone" type="text" class="mt-1 w-full p-2 border rounded-md">
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
              <input v-model="settings.bank_name" id="bankName" type="text" placeholder="Contoh: BCA" class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div>
              <label for="bankAccount" class="block text-sm font-medium">Nomor Rekening</label>
              <input v-model="settings.bank_account" id="bankAccount" type="text" placeholder="Contoh: 1234567890" class="mt-1 w-full p-2 border rounded-md">
            </div>
            <div>
              <label for="bankBeneficiary" class="block text-sm font-medium">Atas Nama</label>
              <input v-model="settings.bank_beneficiary" id="bankBeneficiary" type="text" placeholder="Contoh: PT. DJLABWARE" class="mt-1 w-full p-2 border rounded-md">
            </div>
          </div>
        </div>
        
        <hr class="my-6">

        <div>
          <h3 class="text-lg font-bold">Catatan Dokumen</h3>
          <p class="text-sm text-secondary dark:text-dark-secondary mb-3">Akan tampil di bagian bawah struk & penawaran.</p>
          <div class="mt-2">
            <textarea v-model="settings.store_note" id="storeNote" rows="3" placeholder="Contoh: Barang yang sudah dibeli tidak dapat dikembalikan." class="w-full p-2 border rounded-md"></textarea>
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
            <input type="radio" v-model="selectedTheme" value="light" class="form-radio text-primary focus:ring-primary">
            <span class="ml-2">Light</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="dark" class="form-radio text-primary focus:ring-primary">
            <span class="ml-2">Dark</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="system" class="form-radio text-primary focus:ring-primary">
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

const authStore = useAuthStore();

const settings = reactive({
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

const saveSettings = async () => {
  try {
    await axios.put('/settings', settings);
    alert('Pengaturan berhasil disimpan!');
  } catch (error) {
    alert('Gagal menyimpan pengaturan.');
  }
};
</script>