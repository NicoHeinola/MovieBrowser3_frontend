import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/auth/useAuthStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/public/home/Home.vue'),
    },
    {
      path: '/auth',
      meta: {
        guestOnly: true,
        hideNavigation: true,
      },
      component: () => import('@/pages/public/auth/Auth.vue'),
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/auth';
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/';
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/';
  }

  return true;
});

export default router;
