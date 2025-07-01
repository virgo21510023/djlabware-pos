<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Manajemen Inventaris</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Tambah, lihat, dan perbarui data produk Anda.</p>
    
    <div class="mt-6 bg-surface dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
        <input 
          type="text" 
          placeholder="Cari produk..." 
          class="w-full sm:w-72 p-2 border rounded-md bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button class="w-full sm:w-auto mt-2 sm:mt-0 bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90">
          Tambah Produk
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">SKU</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">Nama Produk</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">Stok</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-secondary dark:text-dark-secondary uppercase tracking-wider">Harga Jual</th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">KM-001</td>
                <td class="px-6 py-4 whitespace-nowrap">Asam Sulfat</td>
                <td class="px-6 py-4 whitespace-nowrap">100</td>
                <td class="px-6 py-4 whitespace-nowrap">Rp 75.000</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" class="text-primary hover:text-primary/80">Edit</a>
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
// Logika untuk fetch, tambah, edit, hapus produk ada di sini
</script>