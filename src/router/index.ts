import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/auth/useAuthStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'authenticated-home',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/authenticated/home/Home.vue'),
    },
    {
      path: '/auth',
      name: 'guest-auth',
      meta: {
        guestOnly: true,
        hideNavigation: true,
      },
      component: () => import('@/pages/guest/auth/Auth.vue'),
    },
    {
      path: '/profile',
      name: 'authenticated-profile',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/authenticated/profile/Profile.vue'),
    },
    {
      path: '/search',
      name: 'authenticated-search',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/authenticated/search/Search.vue'),
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/dashboard/Dashboard.vue'),
    },
    {
      path: '/admin/shows',
      name: 'admin-shows',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/shows/Shows.vue'),
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/settings/Settings.vue'),
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'guest-auth' };
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'authenticated-home' };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'authenticated-home' };
  }

  return true;
});

export default router;
