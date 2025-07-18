import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Atur base URL untuk semua permintaan API
// Saat development, gunakan URL lengkap. Saat produksi, gunakan path relatif.
if (import.meta.env.MODE === 'development') {
    axios.defaults.baseURL = 'http://localhost:5000/api';
} else {
    axios.defaults.baseURL = '/api';
}


// Interceptor untuk menambahkan token otorisasi ke setiap permintaan
axios.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);