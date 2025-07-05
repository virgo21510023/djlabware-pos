import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../router';
import { useToast } from "vue-toastification";

const toast = useToast();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Ambil data dari localStorage agar login tetap ada saat refresh
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'Admin',
  },
  actions: {
    async login(credentials) {
      try {
        // 1. Kirim request ke API backend
        const { data } = await axios.post('/auth/login', credentials);
        
        // 2. Simpan token dan data user ke state
        this.token = data.token;
        this.user = data.user;

        // 3. Simpan juga ke localStorage browser
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 4. Arahkan ke halaman utama setelah login berhasil
        router.push('/');
      } catch (error) {
        console.error('Login failed:', error);
        toast.error('Login Gagal! Periksa kembali username dan password.');
      }
    },

    logout() {
      // Hapus semua data dari state dan localStorage
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    },
  },
});