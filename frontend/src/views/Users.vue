<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Manajemen Pengguna</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Tambah atau hapus akun pengguna kasir.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="flex justify-end mb-4">
        <button @click="openModal" class="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 flex items-center">
          <UserPlus class="w-5 h-5 mr-2" />
          Tambah Kasir
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Nama</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Username</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Peran</th>
              <th class="relative px-6 py-3"><span class="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading"><td colspan="4" class="text-center py-4">Memuat data...</td></tr>
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap font-medium">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.username }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.role === 'Admin' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button v-if="user.role !== 'Admin'" @click="handleDelete(user.id, user.name)" class="text-red-500 hover:text-red-400">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-bold mb-4">Tambah Kasir Baru</h2>
        <form @submit.prevent="handleSave">
          <div class="space-y-4">
            <input v-model="newUser.name" type="text" placeholder="Nama Lengkap" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <input v-model="newUser.username" type="text" placeholder="Username (untuk login)" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
            <input v-model="newUser.password" type="password" placeholder="Password" required class="w-full p-2 border rounded-md bg-background dark:bg-dark-background">
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded-md border">Batal</button>
            <button type="submit" class="px-4 py-2 rounded-md bg-primary text-white">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { UserPlus } from 'lucide-vue-next';
import { useToast } from "vue-toastification";

const toast = useToast();
const users = ref([]);
const loading = ref(false);
const isModalOpen = ref(false);
const newUser = reactive({
  name: '',
  username: '',
  password: ''
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/users');
    users.value = response.data;
  } catch (error) {
    toast.error('Gagal mengambil data pengguna.');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

const openModal = () => {
  Object.assign(newUser, { name: '', username: '', password: '' });
  isModalOpen.value = true;
};

const closeModal = () => isModalOpen.value = false;

const handleSave = async () => {
  try {
    await axios.post('/users', newUser);
    closeModal();
    fetchUsers(); // Refresh daftar pengguna
    toast.success('User berhasil ditambahkan');
  } catch (error) {
    toast.error(`Gagal menyimpan: ${error.response?.data?.message || error.message}`);
  }
};

const handleDelete = async (userId, userName) => {
  if (confirm(`Apakah Anda yakin ingin menghapus kasir "${userName}"?`)) {
    try {
      await axios.delete(`/users/${userId}`);
      fetchUsers(); // Refresh daftar pengguna
      toast.success('User berhasil dihapus');
    } catch (error) {
      toast.error(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
    }
  }
};
</script>