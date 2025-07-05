import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import axios from 'axios'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Setup Axios
axios.defaults.baseURL = 'http://localhost:5000/api'
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


const app = createApp(App)
const pinia = createPinia()

app.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true
});

app.use(pinia)
app.use(router)

app.mount('#app')