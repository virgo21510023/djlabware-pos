<template>
  <div class="flex h-screen bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface">
    
    <aside 
      class="flex-shrink-0 bg-surface dark:bg-dark-surface p-4 flex flex-col transition-all duration-300 ease-in-out"
      :class="isSidebarExpanded ? 'w-64' : 'w-20'"
      @mouseenter="isSidebarExpanded = true"
      @mouseleave="isSidebarExpanded = false"
    >
      <div class="mb-8 flex items-center h-8" :class="isSidebarExpanded ? 'justify-start' : 'justify-center'">
        <FlaskConical class="w-8 h-8 text-primary dark:text-dark-primary flex-shrink-0" />
        <span class="text-2xl font-bold text-primary dark:text-dark-primary ml-2" :class="{ 'hidden': !isSidebarExpanded }">djlabware</span>
      </div>

      <nav class="flex-grow flex flex-col">
        <RouterLink v-for="item in navItems" :key="item.name" :to="item.path"
          class="flex items-center px-4 py-3 mb-2 rounded-full hover:bg-primary/10 relative"
          :class="{ 
            'bg-primary/10 font-semibold text-primary dark:text-dark-primary': $route.name === item.name,
            'justify-center': !isSidebarExpanded,
          }"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span 
            class="ml-3 whitespace-nowrap"
            :class="{ 'hidden': !isSidebarExpanded }"
          >{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="mt-auto w-full">
        <div class="p-2 flex items-center" :class="isSidebarExpanded ? 'flex-row' : 'flex-col'">
          <div class="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mb-2 sm:mb-0 flex-shrink-0">
            {{ userInitials }}
          </div>
          <div class="overflow-hidden" :class="isSidebarExpanded ? 'ml-3' : 'hidden'">
            <p class="font-bold truncate">{{ authStore.user?.name }}</p>
            <p class="text-sm text-secondary dark:text-dark-secondary">{{ authStore.user?.role }}</p>
          </div>
        </div>
        <button @click="authStore.logout()" class="w-full flex items-center px-4 py-3 mt-2 rounded-full hover:bg-red-500/10 text-red-500" :class="{ 'justify-center': !isSidebarExpanded }">
           <LogOut class="w-5 h-5 flex-shrink-0" />
           <span class="ml-3" :class="{ 'hidden': !isSidebarExpanded }">Logout</span>
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
import { ref, shallowRef, computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart2, 
  Users, 
  Settings, 
  LogOut, 
  History as HistoryIcon, 
  FlaskConical,
  Truck,
  ClipboardList
} from 'lucide-vue-next';

const isSidebarExpanded = ref(false);
const authStore = useAuthStore();

const userInitials = computed(() => {
  return authStore.user?.name.charAt(0).toUpperCase() || 'A';
});

const allNavItems = shallowRef([
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'POS', path: '/pos', icon: ShoppingCart },
  { name: 'Inventory', path: '/inventory', icon: Package, admin: true },
  { name: 'Pembelian', path: '/purchasing', icon: Truck, admin: true },
  { name: 'Riwayat Pembelian', path: '/purchase-history', icon: ClipboardList, admin: true },
  { name: 'Riwayat', path: '/history', icon: HistoryIcon, admin: true },
  { name: 'Reports', path: '/reports', icon: BarChart2, admin: true },
  { name: 'Users', path: '/users', icon: Users, admin: true },
  { name: 'Settings', path: '/settings', icon: Settings, admin: true },
]);

const navItems = computed(() => {
    return allNavItems.value.filter(item => !item.admin || authStore.isAdmin);
});
</script>