<script lang="ts" setup>
import type { NavigationLinkItem } from './navigationLinkItem';
import type { Show } from '@/interfaces/api/models/Show';

import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { ChangelogVersionLink } from '@/components/features/changelog/changelog-version-link';
import { LanguageMenu } from '@/components/features/locale/language-menu';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowSearchMenu } from '@/components/features/show/show-search-menu';
import { useChangelogNotice } from '@/composables/changelog/useChangelogNotice';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useRouteLoading } from '@/composables/router/useRouteLoading';
import { useAuthStore } from '@/stores/auth/useAuthStore';

import NavLinks from './NavLinks.vue';

const selectedShowId = ref<number | null>(null);
const isShowDrawerVisible = ref<boolean>(false);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { confirm } = useConfirmDialog();
const { isNavigating } = useRouteLoading();
const { showUnseenChanges } = useChangelogNotice();
const { t } = useI18n();

const authenticatedLinks = computed<NavigationLinkItem[]>(() => [
  { label: t('nav.home'), routeName: 'authenticated-home', icon: 'mdi-home' },
  { label: t('nav.search'), routeName: 'authenticated-search', icon: 'mdi-magnify' },
]);

const adminLinks = computed<NavigationLinkItem[]>(() => [
  { label: t('nav.dashboard'), routeName: 'admin-dashboard', icon: 'mdi-view-dashboard' },
  { label: t('nav.shows'), routeName: 'admin-shows', icon: 'mdi-movie-edit' },
  { label: t('nav.categories'), routeName: 'admin-categories', icon: 'mdi-shape' },
  { label: t('nav.websites'), routeName: 'admin-websites', icon: 'mdi-web' },
  { label: t('nav.users'), routeName: 'admin-users', icon: 'mdi-account-group' },
  { label: t('nav.settings'), routeName: 'admin-settings', icon: 'mdi-cog' },
]);

const isInAdminArea = computed<boolean>(() => String(route.name ?? '').startsWith('admin-'));

/**
 * Opens a show picked from the navigation search in the show drawer.
 * @param show - The picked show.
 * @returns void
 */
const selectShow = (show: Show): void => {
  selectedShowId.value = show.id;
  isShowDrawerVisible.value = true;
};

const logout = async (): Promise<void> => {
  const isConfirmed = await confirm({
    message: t('nav.logoutConfirm'),
    confirmText: t('auth.logout'),
    confirmColor: 'error',
  });

  if (!isConfirmed) {
    return;
  }

  authStore.logout();
  await router.push({ name: 'guest-auth' });
};

onMounted(() => {
  // Unknown URLs show the navigation to guests too, and they shouldn't use up the popup before logging in.
  if (!authStore.isAuthenticated) {
    return;
  }

  // The navigation mounts once a logged-in page opens, so this runs on every visit and after each login.
  void showUnseenChanges();
});
</script>

<template>
  <v-app-bar class="navigation-bar" color="transparent" flat>
    <v-progress-linear
      :active="isNavigating"
      class="position-absolute bottom-0 left-0 w-100"
      color="secondary"
      height="1"
      indeterminate
    />
    <!-- Hidden on phones, where it would crowd the centered links. -->
    <div class="position-absolute left-0 top-0 h-100 d-none d-sm-flex align-center ms-6 z-10">
      <changelog-version-link />
    </div>
    <v-list class="d-flex flex-row ga-6 bg-transparent justify-center px-4 w-100">
      <nav-links :links="adminLinks" v-if="isInAdminArea" />
      <nav-links :links="authenticatedLinks" v-else />
      <v-list class="d-flex flex-row ga-6 bg-transparent position-absolute right-0 top-0 me-4">
        <v-list-item class="d-flex">
          <div class="d-flex align-center ga-4 text-grey-lighten-1">
            <div class="d-none d-md-block" style="width: 280px" v-if="!isInAdminArea">
              <show-search-menu @select:show="selectShow" />
            </div>
            <span>{{ authStore.user?.username }}</span>
            <language-menu />
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
                    <v-list-item :to="{ name: 'authenticated-profile' }" prepend-icon="mdi-cog">
                      {{ t('nav.profile') }}
                    </v-list-item>
                    <v-list-item base-color="error" prepend-icon="mdi-arrow-left" @click="logout">
                      {{ t('auth.logout') }}
                    </v-list-item>
                  </v-list>
                </template>
              </v-menu>
            </v-avatar>
            <v-avatar v-if="authStore.isAdmin">
              <v-btn
                :to="{ name: isInAdminArea ? 'authenticated-home' : 'admin-dashboard' }"
                icon
                v-tooltip:bottom="t('nav.toggleAdmin')"
              >
                <v-icon :color="isInAdminArea ? 'link' : ''" class="transition-color-220"> mdi-key-variant </v-icon>
              </v-btn>
            </v-avatar>
          </div>
        </v-list-item>
      </v-list>
    </v-list>
  </v-app-bar>

  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" v-model:show-id="selectedShowId" />
</template>

<style lang="scss" scoped>
.navigation-bar {
  background: linear-gradient(to bottom, rgb(var(--v-theme-background), 0.67), transparent);
}
</style>
