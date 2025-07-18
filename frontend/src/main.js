import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import './config/axios' 

const app = createApp(App)

app.use(createPinia())

// Pastikan Pinia terpasang sebelum router jika router menggunakan store
app.use(router)

app.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true
});

app.mount('#app')