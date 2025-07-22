import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const zoomLevel = ref(Number(localStorage.getItem('zoomLevel')) || 100);

  function applyZoom(level) {
    document.documentElement.style.fontSize = `${level}%`;
    localStorage.setItem('zoomLevel', level);
  }

  function zoomIn() {
    if (zoomLevel.value < 150) zoomLevel.value += 10;
  }
  function zoomOut() {
    if (zoomLevel.value > 70) zoomLevel.value -= 10;
  }
  function resetZoom() {
    zoomLevel.value = 100;
  }

  watch(zoomLevel, (newLevel) => {
    applyZoom(newLevel);
  });

  // Untuk inisialisasi saat aplikasi dimuat
  function init() {
    applyZoom(zoomLevel.value);
  }

  return { zoomLevel, zoomIn, zoomOut, resetZoom, init };
});