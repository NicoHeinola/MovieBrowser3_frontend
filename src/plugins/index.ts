import type { App } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { watch } from 'vue';

import { configureApiClientAuth } from '@/plugins/api/configureApiClientAuth';
import { i18n } from '@/plugins/i18n';
import { queryClient } from '@/plugins/query';
import router from '@/router';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import vuetify from './vuetify';

export const registerPlugins = (app: App) => {
  const pinia = createPinia();

  app.use(vuetify);
  app.use(pinia);
  app.use(i18n);
  app.use(VueQueryPlugin, { queryClient });

  const authStore = useAuthStore(pinia);
  const settingStore = useSettingStore(pinia);

  configureApiClientAuth({
    getToken: () => authStore.token,
    onUnauthorized: () => {
      authStore.logout();

      if (router.currentRoute.value.name !== 'guest-auth') {
        void router.push({ name: 'guest-auth' });
      }
    },
  });

  // Reading settings needs a login, so load them whenever a token appears: at startup when already logged in, and
  // right after login or registration, so home has its banner defaults. Logging out drops them with the token.
  watch(
    () => authStore.token,
    (token: string | null) => {
      if (token) {
        void settingStore.fetchSettings();
      } else {
        settingStore.clearSettings();
      }
    },
    { immediate: true },
  );

  app.use(router);
};
