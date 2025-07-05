import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from "vue-toastification";

const toast = useToast();

export const useProductStore = defineStore('product', {
  state: () => ({
    // Untuk data paginasi di halaman Inventaris
    paginatedProducts: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    
    // Untuk daftar lengkap di halaman POS dan Pembelian
    allProducts: [],

    loading: false,
  }),
  
  actions: {
    // Action untuk mengambil data DENGAN paginasi (untuk Inventaris)
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
        toast.error('Gagal mengambil data produk (paginasi):', error);
      } finally {
        this.loading = false;
      }
    },

    // Action BARU untuk mengambil SEMUA produk (untuk POS & Pembelian)
    async fetchAllProducts() {
      this.loading = true;
      try {
        const config = {
          params: { limit: 10000 } // Ambil hingga 10,000 produk
        };
        const response = await axios.get('/products', config);
        this.allProducts = response.data.products;
      } catch (error) {
        toast.error('Gagal mengambil semua produk:', error);
      } finally {
        this.loading = false;
      }
    },

    // Action lain (tidak berubah signifikan, hanya refresh data)
    async addProduct(newProduct) {
      // ...
      await this.fetchProducts(1); // Refresh data paginasi
      await this.fetchAllProducts(); // Refresh data lengkap
    },
    async updateProduct(productData) {
      // ...
      await this.fetchProducts(this.currentPage);
      await this.fetchAllProducts();
    },
    async deleteProduct(productId) {
      // ...
      await this.fetchProducts(this.currentPage);
      await this.fetchAllProducts();
    },
  },
});