<template>
  <div>
    <h1 class="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Dashboard</h1>
    <p class="mt-2 text-secondary dark:text-dark-secondary">Ringkasan aktivitas bisnis hari ini.</p>
    
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">Total Penjualan</h2>
        <p class="text-3xl font-bold mt-2">Rp 1.200.000</p>
      </div>
      <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">Total Transaksi</h2>
        <p class="text-3xl font-bold mt-2">15</p>
      </div>
       <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">Produk Terlaris</h2>
        <p class="text-3xl font-bold mt-2">Asam Sulfat</p>
      </div>
       <div class="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow">
        <h2 class="text-sm font-medium text-secondary dark:text-dark-secondary">Stok Kritis</h2>
        <p class="text-3xl font-bold mt-2">3 Produk</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Nanti di sini kita akan fetch data summary dari API
</script>