<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div class="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-sm shadow-xl text-center">

      <!-- Ikon Dinamis -->
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full"
        :class="variant === 'danger' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-blue-100 dark:bg-blue-900/50'">
        <component :is="icon" class="h-6 w-6"
          :class="variant === 'danger' ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'" />
      </div>

      <h3 class="text-lg font-medium mt-4">{{ title }}</h3>
      <p class="text-sm text-secondary dark:text-dark-secondary mt-2">{{ message }}</p>

      <div class="mt-6 flex justify-center space-x-4">
        <button @click="$emit('cancel')" class="px-4 py-2 w-24 rounded-md border">
          Batal
        </button>
        <!-- Tombol & Teks Konfirmasi Dinamis -->
        <button @click="$emit('confirm')" class="px-4 py-2 w-32 rounded-md text-white"
          :class="variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Kita tidak perlu lagi mengimpor AlertTriangle di sini
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: 'Anda Yakin?' },
  message: { type: String, default: 'Aksi ini tidak dapat dibatalkan.' },
  variant: { type: String, default: 'danger' },
  confirmText: { type: String, default: 'Hapus' },
  // PERBAIKAN: Jadikan ikon sebagai properti wajib
  icon: {
    type: [Object, Function], // Terima Objek atau Fungsi
    required: true
  }
});

defineEmits(['confirm', 'cancel']);
</script>