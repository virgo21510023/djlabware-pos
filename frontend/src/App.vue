<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useUiStore } from './stores/uiStore';

const uiStore = useUiStore();

onMounted(() => {
  uiStore.init(); // Terapkan zoom yang tersimpan
})
</script>

<template>
  <RouterView />
</template>