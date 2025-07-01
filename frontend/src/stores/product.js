import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
  }),
  
  // PASTIKAN addProduct BERADA DI DALAM BLOK 'actions' INI
  actions: {
    async fetchProducts() {
      this.loading = true;
      try {
        const config = {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
        const response = await axios.get('/products', config);
        this.products = response.data.products;
      } catch (error) {
        console.error('Gagal mengambil data produk:', error);
        alert('Gagal mengambil data produk.');
      } finally {
        this.loading = false;
      }
    },

    async addProduct(newProduct) {
      try {
        await axios.post('/products', newProduct);
        // Panggil lagi fetchProducts untuk refresh data
        await this.fetchProducts();
      } catch (error) {
        console.error('Gagal menambah produk:', error);
        alert(`Gagal menambah produk: ${error.response?.data?.message || error.message}`);
        // Lempar error agar komponen bisa menangani jika perlu
        throw error;
      }
    },
  },
});