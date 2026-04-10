import type { App } from 'vue';
import { createPinia } from 'pinia';
import { configureApiClientAuth } from '@/plugins/api/apiClient';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import router from '../router';
import vuetify from './vuetify';

export const registerPlugins = (app: App) => {
  const pinia = createPinia();

  app.use(vuetify);
  app.use(pinia);

  const authStore = useAuthStore(pinia);
  const settingStore = useSettingStore(pinia);

  configureApiClientAuth({
    getToken: () => authStore.token,
    onUnauthorized: () => {
      authStore.logout();

      if (router.currentRoute.value.name !== 'auth') {
        void router.push({ name: 'auth' });
      }
    },
  });

  void settingStore.fetchSettings();

  app.use(router);
};
