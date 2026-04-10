import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/auth/useAuthStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/public/home/Home.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      meta: {
        guestOnly: true,
        hideNavigation: true,
      },
      component: () => import('@/pages/public/auth/Auth.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/profile/Profile.vue'),
    },
    {
      path: '/search',
      name: 'search',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/public/search/Search.vue'),
    },
    {
      path: '/control-panel',
      name: 'control-panel-dashboard',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/control-panel/dashboard/Dashboard.vue'),
    },
    {
      path: '/control-panel/shows',
      name: 'control-panel-shows',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/control-panel/shows/Shows.vue'),
    },
    {
      path: '/control-panel/settings',
      name: 'control-panel-settings',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/control-panel/settings/Settings.vue'),
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'auth' };
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'home' };
  }

  return true;
});

export default router;
