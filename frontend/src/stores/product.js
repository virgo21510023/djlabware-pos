import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    // State baru untuk paginasi
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  }),
  
  // PASTIKAN addProduct BERADA DI DALAM BLOK 'actions' INI
  actions: {
    async fetchProducts(page = 1) {
      this.loading = true;
      try {
        const config = {
          headers: { 'Cache-Control': 'no-cache' },
          // Kirim parameter page ke API
          params: { page }
        };
        const response = await axios.get('/products', config);
        
        // Simpan data produk dan paginasi
        this.products = response.data.products;
        this.currentPage = response.data.currentPage;
        this.totalPages = response.data.totalPages;
        this.totalItems = response.data.totalItems;

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

    async updateProduct(productData) {
  try {
    // Pastikan kita mengirim ID di URL
    await axios.put(`/products/${productData.id}`, productData);
    await this.fetchProducts(); // Refresh data setelah update
  } catch (error) {
    console.error('Gagal memperbarui produk:', error);
    alert(`Gagal memperbarui produk: ${error.response?.data?.message || error.message}`);
    throw error;
  }
},

async deleteProduct(productId) {
  try {
    await axios.delete(`/products/${productId}`);
    await this.fetchProducts(); // Refresh data setelah hapus
  } catch (error) {
    console.error('Gagal menghapus produk:', error);
    alert(`Gagal menghapus produk: ${error.response?.data?.message || error.message}`);
    throw error;
  }
},
  },
});