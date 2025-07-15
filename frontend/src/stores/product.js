import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    paginatedProducts: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    allProducts: [],
    loading: false,
  }),
  
  actions: {
    async fetchProducts(page = 1, search = '') {
      this.loading = true;
      try {
        const config = {
          params: { page, limit: 10, search }
        };
        const response = await axios.get('/products', config);
        this.paginatedProducts = response.data.products;
        this.currentPage = response.data.currentPage;
        this.totalPages = response.data.totalPages;
        this.totalItems = response.data.totalItems;
      } catch (error) {
        console.error('Gagal mengambil data produk (paginasi):', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchAllProducts() {
      this.loading = true;
      try {
        const config = {
          params: { limit: 10000 }
        };
        const response = await axios.get('/products', config);
        this.allProducts = response.data.products;
      } catch (error) {
        console.error('Gagal mengambil semua produk:', error);
      } finally {
        this.loading = false;
      }
    },

    async addProduct(newProduct) {
      try {
        await axios.post('/products', newProduct);
        await this.fetchProducts(1);
        await this.fetchAllProducts();
      } catch (error) {
        console.error('Gagal menambah produk:', error);
        throw error;
      }
    },
    
    // FUNGSI YANG PERLU DIPERBAIKI ADA DI SINI
    async updateProduct(productData) {
      try {
        // Baris ini mengirim permintaan PUT ke backend
        await axios.put(`/products/${productData.id}`, productData);
        // Baris ini me-refresh data di halaman saat ini
        await this.fetchProducts(this.currentPage, '');
      } catch (error) {
        console.error('Gagal memperbarui produk:', error);
        throw error;
      }
    },

    async deleteProduct(productId) {
      try {
        await axios.delete(`/products/${productId}`);
        await this.fetchProducts(this.currentPage, '');
      } catch (error) {
        console.error('Gagal menghapus produk:', error);
        throw error;
      }
    },
  },
});