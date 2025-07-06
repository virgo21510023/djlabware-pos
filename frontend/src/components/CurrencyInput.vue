<template>
  <input
    ref="inputRef"
    :value="formattedValue"
    @input="handleInput"
    placeholder="0"
    class="w-full p-2 border rounded-md text-right bg-background dark:bg-dark-background"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue']);

const formattedValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return '';
  return props.modelValue.toLocaleString('id-ID');
});

const handleInput = (event) => {
  // Hapus semua karakter non-digit
  const rawValue = event.target.value.replace(/[^0-9]/g, '');
  const numberValue = rawValue ? parseInt(rawValue, 10) : 0;
  emit('update:modelValue', numberValue);
};
</script>