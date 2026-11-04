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
import { UpdateNotice } from '@/components/features/version/update-notice';
import { useChangelogNotice } from '@/composables/changelog/useChangelogNotice';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useAuthStore } from '@/stores/auth/useAuthStore';

import NavLinks from './NavLinks.vue';

const selectedShowId = ref<number | null>(null);
const isShowDrawerVisible = ref<boolean>(false);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { confirm } = useConfirmDialog();
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
    <!-- The side columns share the leftover width equally, so the links stay centered in both areas. -->
    <div class="d-flex align-center ga-4 w-100 px-4">
      <div class="flex-1-1-0 d-flex align-center ga-2">
        <!-- Hidden on phones, where it would crowd the centered links. -->
        <div class="d-none d-sm-flex">
          <changelog-version-link />
        </div>
        <update-notice v-if="authStore.isAdmin" />
      </div>

      <v-list class="d-flex flex-row ga-6 bg-transparent position-relative">
        <nav-links :links="adminLinks" v-if="isInAdminArea" />
        <nav-links :links="authenticatedLinks" v-else />
      </v-list>

      <div class="flex-1-1-0 d-flex align-center justify-end ga-2">
        <div class="d-none d-md-block" style="width: 280px" v-if="!isInAdminArea">
          <show-search-menu @select:show="selectShow" />
        </div>
        <v-btn
          :to="{ name: isInAdminArea ? 'authenticated-home' : 'admin-dashboard' }"
          color="default"
          icon
          v-tooltip:bottom="t('nav.toggleAdmin')"
          v-if="authStore.isAdmin"
        >
          <v-icon :color="isInAdminArea ? 'link' : undefined" class="transition-color-220">mdi-key-variant</v-icon>
        </v-btn>
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :aria-label="authStore.user?.username"
              color="default"
              icon
              v-tooltip:bottom="authStore.user?.username"
            >
              <v-icon :color="route.name === 'authenticated-profile' ? 'link' : undefined" class="transition-color-220">
                mdi-account
              </v-icon>
            </v-btn>
          </template>
          <v-list min-width="220">
            <v-list-subheader v-if="authStore.user">{{ authStore.user.username }}</v-list-subheader>
            <v-list-item :title="t('nav.profile')" :to="{ name: 'authenticated-profile' }" prepend-icon="mdi-cog" />
            <language-menu location="start" submenu>
              <template #activator="{ props: languageMenuProps }">
                <v-list-item v-bind="languageMenuProps" :title="t('locale.change')" prepend-icon="mdi-translate" />
              </template>
            </language-menu>
            <v-divider class="my-2" />
            <v-list-item :title="t('auth.logout')" base-color="error" prepend-icon="mdi-arrow-left" @click="logout" />
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-app-bar>

  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" v-model:show-id="selectedShowId" />
</template>

<style lang="scss" scoped>
.navigation-bar {
  background: linear-gradient(to bottom, rgb(var(--v-theme-background), 0.67), transparent);
}
</style>
