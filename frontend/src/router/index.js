import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth';

import AppLayout from '../layouts/AppLayout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Pos from '../views/Pos.vue'
import Purchasing from '../views/Purchasing.vue';
import PurchaseHistory from '../views/PurchaseHistory.vue';
import Inventory from '../views/Inventory.vue'
import History from '../views/History.vue';
import Reports from '../views/Reports.vue';
import Users from '../views/Users.vue';
import Settings from '../views/Settings.vue';
import CreateQuotation from '../views/CreateQuotation.vue';
import QuotationHistory from '../views/QuotationHistory.vue';
import InvoiceList from '../views/InvoiceList.vue';
import InvoiceDetail from '../views/InvoiceDetail.vue';
import DeliveryOrderDetail from '../views/DeliveryOrderDetail.vue';
import PurchaseOrderList from '../views/PurchaseOrderList.vue';
import CreatePurchaseOrder from '../views/CreatePurchaseOrder.vue';
import PurchaseOrderDetail from '../views/PurchaseOrderDetail.vue';

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
      { path: 'purchasing', name: 'Pembelian', component: Purchasing, meta: { requiresAdmin: true } },
      { path: 'purchase-history', name: 'Riwayat Pembelian', component: PurchaseHistory, meta: { requiresAdmin: true } },
      { path: 'inventory', name: 'Inventory', component: Inventory, meta: { requiresAdmin: true } },
      { path: 'history', name: 'Riwayat', component: History, meta: { requiresAdmin: true } },
      { path: 'reports', name: 'Reports', component: Reports, meta: { requiresAdmin: true } },
      { path: 'users', name: 'Users', component: Users, meta: { requiresAdmin: true } },
      { path: 'settings', name: 'Settings', component: Settings, meta: { requiresAdmin: true } },
      { path: 'quotations/new', name: 'Buat Penawaran', component: CreateQuotation, meta: { requiresAdmin: true } },
      { path: 'quotations', name: 'Riwayat Penawaran', component: QuotationHistory, meta: { requiresAdmin: true } },
      { path: 'invoices', name: 'Daftar Invoice', component: InvoiceList, meta: { requiresAdmin: true } },
      { path: '/invoices/:id', name: 'Detail Invoice', component: InvoiceDetail, meta: { requiresAdmin: true } },
      { path: '/delivery-order/:id/print', name: 'Cetak Surat Jalan', component: DeliveryOrderDetail, meta: { requiresAuth: true, isAdmin: true } },
      { path: '/purchase-orders', name: 'Daftar Purchase Order', component: PurchaseOrderList, meta: { requiresAdmin: true } },
      { path: '/purchase-orders/create', name: 'Buat Purchase Order', component: CreatePurchaseOrder, meta: { requiresAdmin: true } },
      { path: '/purchase-orders/:id', name: 'Detail Purchase Order', component: PurchaseOrderDetail, meta: { requiresAdmin: true } },
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