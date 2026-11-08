import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useSetupStore } from '@/stores/setup/useSetupStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'authenticated-home',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/authenticated/home/HomeView.vue'),
    },
    {
      path: '/auth',
      name: 'guest-auth',
      meta: {
        guestOnly: true,
        hideNavigation: true,
      },
      component: () => import('@/pages/guest/auth/AuthView.vue'),
    },
    {
      path: '/profile',
      name: 'authenticated-profile',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/authenticated/profile/ProfileView.vue'),
    },
    {
      path: '/changelog',
      name: 'authenticated-changelog',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/authenticated/changelog/ChangelogView.vue'),
    },
    {
      path: '/search',
      name: 'authenticated-search',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/pages/authenticated/search/SearchView.vue'),
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/dashboard/DashboardView.vue'),
    },
    {
      path: '/admin/shows',
      name: 'admin-shows',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/shows/ShowsView.vue'),
    },
    {
      path: '/admin/shows/new',
      name: 'admin-show-new',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        activeNavRouteName: 'admin-shows',
      },
      component: () => import('@/pages/admin/show-edit/ShowEditView.vue'),
    },
    {
      path: String.raw`/admin/shows/:showId(\d+)`,
      name: 'admin-show-edit',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        activeNavRouteName: 'admin-shows',
      },
      component: () => import('@/pages/admin/show-edit/ShowEditView.vue'),
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/categories/CategoriesView.vue'),
    },
    {
      path: '/admin/websites',
      name: 'admin-websites',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/websites/WebsitesView.vue'),
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/users/UsersView.vue'),
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      component: () => import('@/pages/admin/settings/SettingsView.vue'),
    },
    {
      path: '/admin/setup',
      name: 'admin-setup',
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        hideNavigation: true,
      },
      component: () => import('@/pages/admin/setup/SetupView.vue'),
    },
  ],
});

/**
 * Tells whether an admin should be sent to the setup wizard. A failed status request lets them through, so a backend
 * without the setup endpoints never locks admins out of the app.
 * @returns `true` while setup is due.
 */
const isSetupDue = async (): Promise<boolean> => {
  const setupStore = useSetupStore();

  try {
    return await setupStore.isSetupDue();
  } catch {
    // Skip for the session, so every later navigation doesn't wait on the same failing request again. A 401 has
    // already logged the user out (and reset the setup store), so it must not skip: the next admin to log in still
    // gets the wizard.
    if (useAuthStore().isAuthenticated) {
      setupStore.skip();
    }

    return false;
  }
};

router.beforeEach(async (to) => {
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

  // Videos can't play until an admin sets the video folder and VLC, so admins go to the setup wizard first.
  if (authStore.isAdmin && to.name !== 'admin-setup' && (await isSetupDue())) {
    return { name: 'admin-setup' };
  }

  return true;
});

export default router;
