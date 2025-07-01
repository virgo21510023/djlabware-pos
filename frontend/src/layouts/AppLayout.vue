<template>
  <div class="flex h-screen bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface">
    <aside class="w-64 flex-shrink-0 bg-surface dark:bg-dark-surface p-4 flex flex-col">
      <h1 class="text-2xl font-bold text-primary dark:text-dark-primary mb-8">djlabware POS</h1>
      <nav class="flex-grow">
        <RouterLink v-for="item in navItems" :key="item.name" :to="item.path"
          class="flex items-center px-4 py-3 mb-2 rounded-full hover:bg-primary/10"
          :class="{ 'bg-primary/10 font-semibold text-primary dark:text-dark-primary': $route.name === item.name }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>
      <div class="mt-auto">
        <div class="p-2">
            <p class="font-bold">{{ authStore.user?.name }}</p>
            <p class="text-sm text-secondary dark:text-dark-secondary">{{ authStore.user?.role }}</p>
        </div>
        <button @click="authStore.logout()" class="w-full flex items-center px-4 py-3 rounded-full hover:bg-red-500/10 text-red-500">
           <LogOut class="w-5 h-5 mr-3" />
           <span>Logout</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden">
        <header class="p-4 border-b border-surface dark:border-dark-surface/50">
            <h2 class="text-xl font-medium">{{ $route.name }}</h2>
        </header>
        <div class="flex-1 overflow-y-auto p-6">
            <RouterView />
        </div>
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { shallowRef, computed } from 'vue';
import { LayoutDashboard, ShoppingCart, Package, BarChart2, Users, Settings, LogOut } from 'lucide-vue-next';

const authStore = useAuthStore();

const allNavItems = shallowRef([
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'POS', path: '/pos', icon: ShoppingCart },
  { name: 'Inventory', path: '/inventory', icon: Package, admin: true },
  { name: 'Reports', path: '/reports', icon: BarChart2, admin: true },
  { name: 'Users', path: '/users', icon: Users, admin: true },
  { name: 'Settings', path: '/settings', icon: Settings, admin: true },
]);

const navItems = computed(() => {
    return allNavItems.value.filter(item => !item.admin || authStore.isAdmin)
})
</script>