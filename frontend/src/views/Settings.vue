<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Pengaturan</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Atur preferensi aplikasi dan informasi toko Anda.</p>
    
    <div v-if="authStore.isAdmin" class="mt-8">
      <h2 class="text-xl font-bold">Informasi Toko</h2>
      <p class="text-sm text-secondary dark:text-dark-secondary mb-4">Informasi ini akan ditampilkan pada struk/nota.</p>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <form @submit.prevent="saveStoreInfo" class="space-y-4">
          <div>
            <label for="storeName" class="block text-sm font-medium">Nama Toko</label>
            <input v-model="storeInfo.store_name" type="text" id="storeName" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          </div>
          <div>
            <label for="storeAddress" class="block text-sm font-medium">Alamat Toko</label>
            <textarea v-model="storeInfo.store_address" id="storeAddress" rows="3" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background"></textarea>
          </div>
           <div>
            <label for="storePhone" class="block text-sm font-medium">No. Telepon / Kontak</label>
            <input v-model="storeInfo.store_phone" type="text" id="storePhone" class="mt-1 w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          </div>
          <div class="flex justify-end">
            <button type="submit" class="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90">
              Simpan Informasi
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-xl font-bold">Tema Tampilan</h2>
      <p class="text-sm text-secondary dark:text-dark-secondary mb-4">Pilih tema favorit Anda.</p>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <div class="flex items-center space-x-8">
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="light" class="form-radio">
            <span class="ml-2">Light</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="dark" class="form-radio">
            <span class="ml-2">Dark</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="selectedTheme" value="system" class="form-radio">
            <span class="ml-2">Sistem</span>
          </label>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

// --- Logika untuk Informasi Toko ---
const storeInfo = reactive({
  store_name: '',
  store_address: '',
  store_phone: ''
});

const fetchStoreInfo = async () => {
  if (authStore.isAdmin) {
    try {
      const response = await axios.get('/settings');
      Object.assign(storeInfo, response.data);
    } catch (error) {
      console.error("Gagal mengambil info toko:", error);
    }
  }
};

const saveStoreInfo = async () => {
  try {
    await axios.put('/settings', storeInfo);
    alert('Informasi toko berhasil disimpan!');
  } catch (error) {
    alert('Gagal menyimpan informasi toko.');
  }
};

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

// Tonton perubahan pada 'selectedTheme' dan terapkan tema
watch(selectedTheme, (newTheme) => {
  applyTheme(newTheme);
});

// Terapkan tema saat komponen pertama kali dimuat
onMounted(() => {
  applyTheme(selectedTheme.value);
  fetchStoreInfo();
});
</script>