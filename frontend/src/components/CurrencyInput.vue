<template>
  <input
    type="text"
    v-model="formattedValue"
    @blur="isFocused = false"
    @focus="isFocused = true"
    placeholder="0"
    class="w-full p-2 border rounded-md text-right bg-background dark:bg-dark-background"
  />
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0
  }
});

const emit = defineEmits(['update:modelValue']);
const isFocused = ref(false);

const formattedValue = computed({
  get() {
    if (isFocused.value) {
      // Saat input di-fokus, tampilkan angka mentah tanpa format
      return props.modelValue || '';
    }
    // Saat tidak di-fokus, tampilkan angka dengan format Rupiah
    const numberValue = Number(props.modelValue || 0);
    return numberValue.toLocaleString('id-ID');
  },
  set(value) {
    // Hapus semua karakter non-digit untuk mendapatkan angka mentah
    const rawValue = value.replace(/[^0-9]/g, '');
    const numberValue = rawValue ? parseInt(rawValue, 10) : 0;
    emit('update:modelValue', numberValue);
  }
});
</script>