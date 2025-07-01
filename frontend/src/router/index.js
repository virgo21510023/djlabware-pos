import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth';

import AppLayout from '../layouts/AppLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Pos from '../views/Pos.vue'
import Login from '../views/Login.vue'
import Inventory from '../views/Inventory.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'pos', name: 'POS', component: Pos },
      { path: 'inventory', name: 'Inventory', component: Inventory, meta: { requiresAdmin: true } },
      // Tambahkan route lain di sini
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login' });
  } else if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Dashboard' }); // Redirect jika bukan admin
  } else {
    next();
  }
});

export default router;