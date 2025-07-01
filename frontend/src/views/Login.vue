<template>
  <div class="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
    <div class="w-full max-w-md p-8 space-y-8 bg-surface dark:bg-dark-surface rounded-2xl shadow-lg">
      <div>
        <h1 class="text-3xl font-bold text-center text-primary dark:text-dark-primary">djlabware POS</h1>
        <p class="mt-2 text-center text-secondary dark:text-dark-secondary">Selamat datang kembali!</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input v-model="username" id="username" name="username" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 bg-transparent text-on-surface dark:text-dark-on-surface rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Username">
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input v-model="password" id="password" name="password" type="password" required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 bg-transparent text-on-surface dark:text-dark-on-surface rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Password">
          </div>
        </div>
        <div>
          <button type="submit"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const username = ref('admin');
const password = ref('admin123');

const handleLogin = () => {
  if (!username.value || !password.value) {
    alert('Username dan password harus diisi!');
    return;
  }
  // Panggil action 'login' dari store dengan membawa data form
  authStore.login({ username: username.value, password: password.value });
};
</script>