import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import BranchesView from '@/views/BranchesView.vue';
import CheckoutView from '@/views/CheckoutView.vue';
import OrderTrackingView from '@/views/OrderTrackingView.vue';
import DashboardView from '@/views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sucursales',
      name: 'branches',
      component: BranchesView,
    },
    {
      path: '/carrito',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/rastreo',
      name: 'tracking',
      component: OrderTrackingView,
    },
    {
      path: '/tablero',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
