<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ConfirmDialog, type ConfirmDialogProps } from '@/components/common/confirm-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAuthStore } from '@/stores/auth/useAuthStore';

import ControlPanelNavLinks from './ControlPanelNavLinks.vue';
import PublicNavLinks from './PublicNavLinks.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const dialog = useDialog();

type LogoutConfirmDialogProps = Omit<ConfirmDialogProps, 'close' | 'modelValue'>;

const isInControlPanel = computed(() => String(route.name ?? '').startsWith('control-panel-'));

const logout = async (): Promise<void> => {
  const isConfirmed = await dialog.showDialog<boolean, LogoutConfirmDialogProps>({
    component: ConfirmDialog,
    props: {
      message: 'Log out of your account?',
      confirmText: 'Logout',
      confirmColor: 'error',
    },
  });

  if (!isConfirmed) {
    return;
  }

  authStore.logout();
  await router.push({ name: 'auth' });
};
</script>

<template>
  <v-app-bar class="navigation-bar px-4" color="transparent" flat>
    <v-list class="d-flex flex-row ga-6 bg-transparent justify-center w-100">
      <control-panel-nav-links v-if="isInControlPanel" />
      <public-nav-links v-else />
      <v-list class="d-flex flex-row ga-6 bg-transparent position-absolute right-0 top-0">
        <v-list-item class="d-flex">
          <div class="d-flex align-center ga-4 text-grey-lighten-1">
            <span>{{ authStore.user?.username }}</span>
            <v-avatar>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon v-bind="props">
                    <v-icon :color="route.name === 'profile' ? 'link' : undefined" class="transition-color-220">
                      mdi-account
                    </v-icon>
                  </v-btn>
                </template>
                <template #default>
                  <v-list>
                    <v-list-item :to="{ name: 'profile' }" prepend-icon="mdi-cog"> Profile </v-list-item>
                    <v-list-item base-color="error" prepend-icon="mdi-arrow-left" @click="logout"> Logout </v-list-item>
                  </v-list>
                </template>
              </v-menu>
            </v-avatar>
            <v-avatar v-if="authStore.isAdmin">
              <v-btn
                :to="{ name: isInControlPanel ? 'home' : 'control-panel-dashboard' }"
                icon
                v-tooltip:bottom="'Toggle Control Panel'"
              >
                <v-icon :color="isInControlPanel ? 'link' : ''" class="transition-color-220"> mdi-key-variant </v-icon>
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
