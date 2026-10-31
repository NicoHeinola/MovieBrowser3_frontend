<script lang="ts" setup>
import type { NavigationLinkItem } from './navigationLinkItem';

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useRouteLoading } from '@/composables/router/useRouteLoading';
import { useAuthStore } from '@/stores/auth/useAuthStore';

import NavLinks from './NavLinks.vue';

const authenticatedLinks: NavigationLinkItem[] = [
  { label: 'Home', routeName: 'authenticated-home', icon: 'mdi-home' },
  { label: 'Search', routeName: 'authenticated-search', icon: 'mdi-magnify' },
];

const adminLinks: NavigationLinkItem[] = [
  { label: 'Dashboard', routeName: 'admin-dashboard', icon: 'mdi-view-dashboard' },
  { label: 'Shows', routeName: 'admin-shows', icon: 'mdi-movie-edit' },
  { label: 'Categories', routeName: 'admin-categories', icon: 'mdi-shape' },
  { label: 'Websites', routeName: 'admin-websites', icon: 'mdi-web' },
  { label: 'Settings', routeName: 'admin-settings', icon: 'mdi-cog' },
];

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { confirm } = useConfirmDialog();
const { isNavigating } = useRouteLoading();

const isInAdminArea = computed<boolean>(() => String(route.name ?? '').startsWith('admin-'));

const logout = async (): Promise<void> => {
  const isConfirmed = await confirm({
    message: 'Log out of your account?',
    confirmText: 'Logout',
    confirmColor: 'error',
  });

  if (!isConfirmed) {
    return;
  }

  authStore.logout();
  await router.push({ name: 'guest-auth' });
};
</script>

<template>
  <v-app-bar class="navigation-bar" color="transparent" flat>
    <v-progress-linear
      :active="isNavigating"
      class="position-absolute bottom-0 left-0 w-100"
      color="primary"
      height="3"
      indeterminate
    />
    <v-list class="d-flex flex-row ga-6 bg-transparent justify-center px-4 w-100">
      <nav-links :links="adminLinks" v-if="isInAdminArea" />
      <nav-links :links="authenticatedLinks" v-else />
      <v-list class="d-flex flex-row ga-6 bg-transparent position-absolute right-0 top-0 me-4">
        <v-list-item class="d-flex">
          <div class="d-flex align-center ga-4 text-grey-lighten-1">
            <span>{{ authStore.user?.username }}</span>
            <v-avatar>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn v-bind="props" color="default" icon>
                    <v-icon
                      :color="route.name === 'authenticated-profile' ? 'link' : undefined"
                      class="transition-color-220"
                    >
                      mdi-account
                    </v-icon>
                  </v-btn>
                </template>
                <template #default>
                  <v-list>
                    <v-list-item :to="{ name: 'authenticated-profile' }" prepend-icon="mdi-cog"> Profile </v-list-item>
                    <v-list-item base-color="error" prepend-icon="mdi-arrow-left" @click="logout"> Logout </v-list-item>
                  </v-list>
                </template>
              </v-menu>
            </v-avatar>
            <v-avatar v-if="authStore.isAdmin">
              <v-btn
                :to="{ name: isInAdminArea ? 'authenticated-home' : 'admin-dashboard' }"
                icon
                v-tooltip:bottom="'Toggle Admin Area'"
              >
                <v-icon :color="isInAdminArea ? 'link' : ''" class="transition-color-220"> mdi-key-variant </v-icon>
              </v-btn>
            </v-avatar>
          </div>
        </v-list-item>
      </v-list>
    </v-list>
  </v-app-bar>
</template>

<style lang="scss" scoped>
.navigation-bar {
  background: linear-gradient(to bottom, rgb(var(--v-theme-background), 0.67), transparent);
}
</style>
