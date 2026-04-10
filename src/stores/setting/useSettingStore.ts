import type { SettingsResponse } from '@/interfaces/api/models/SettingsResponse';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { settingService } from '@/services/setting/settingService';

export const useSettingStore = defineStore('setting', () => {
  const settings = ref<SettingsResponse>({});
  const isLoading = ref<boolean>(false);

  const bannerDefaultVideos = computed<string[]>(() => {
    return (settings.value.banner_default_videos?.value as string[]) || [];
  });

  const bannerDefaultBackgrounds = computed<string[]>(() => {
    return (settings.value.banner_default_backgrounds?.value as string[]) || [];
  });

  const fetchSettings = async () => {
    isLoading.value = true;
    try {
      settings.value = await settingService.getSettings();
    } finally {
      isLoading.value = false;
    }
  };

  const getSetting = <T = unknown>(key: string): T | undefined => {
    return settings.value[key]?.value as T;
  };

  return {
    settings,
    isLoading,
    bannerDefaultVideos,
    bannerDefaultBackgrounds,
    fetchSettings,
    getSetting,
  };
});
