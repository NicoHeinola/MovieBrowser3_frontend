<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useAuthStore } from '@/stores/auth/useAuthStore';

import AdminNavLinks from './AdminNavLinks.vue';
import AuthenticatedNavLinks from './AuthenticatedNavLinks.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { confirm } = useConfirmDialog();

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
  <v-app-bar class="navigation-bar px-4" color="transparent" flat>
    <v-list class="d-flex flex-row ga-6 bg-transparent justify-center w-100">
      <admin-nav-links v-if="isInAdminArea" />
      <authenticated-nav-links v-else />
      <v-list class="d-flex flex-row ga-6 bg-transparent position-absolute right-0 top-0">
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
