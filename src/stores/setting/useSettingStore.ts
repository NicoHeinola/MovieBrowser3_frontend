import type { SettingsResponse } from '@/interfaces/api/models/SettingsResponse';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { settingService } from '@/services/setting/settingService';

export const useSettingStore = defineStore('setting', () => {
  const settings = ref<SettingsResponse>({});
  const isLoading = ref<boolean>(false);

  const getSettingValue = <T = unknown>(key: string): T => {
    const settingValue = settings.value[key]?.value;

    if (settingValue === undefined) {
      throw new Error(`Setting with key "${key}" not found`);
    }

    return settingValue as T;
  };

  const bannerDefaultVideos = computed<string[]>(() => {
    return getSettingValue<string[]>('banner_default_videos');
  });

  const bannerDefaultBackgrounds = computed<string[]>(() => {
    return getSettingValue<string[]>('banner_default_backgrounds');
  });

  const fetchSettings = async (): Promise<void> => {
    isLoading.value = true;
    try {
      settings.value = await settingService.getSettings();
    } finally {
      isLoading.value = false;
    }
  };

  const addBannerDefaultBackground = async (url: string): Promise<void> => {
    const trimmedUrl = url.trim();

    if (trimmedUrl === '') {
      return;
    }

    const backgrounds = getSettingValue<string[]>('banner_default_backgrounds');

    await settingService.updateSetting('banner_default_backgrounds', {
      value: [...backgrounds, trimmedUrl],
    });

    await fetchSettings();
  };

  const removeBannerDefaultBackground = async (url: string): Promise<void> => {
    const trimmedUrl = url.trim();

    if (trimmedUrl === '') {
      return;
    }

    const backgrounds = getSettingValue<string[]>('banner_default_backgrounds');
    const nextBackgrounds = backgrounds.filter((backgroundUrl: string) => backgroundUrl !== trimmedUrl);

    if (nextBackgrounds.length === backgrounds.length) {
      return;
    }

    await settingService.updateSetting('banner_default_backgrounds', {
      value: nextBackgrounds,
    });

    await fetchSettings();
  };

  const getSetting = <T = unknown>(key: string): T | undefined => {
    return settings.value[key]?.value as T;
  };

  return {
    settings,
    isLoading,
    bannerDefaultVideos,
    bannerDefaultBackgrounds,
    addBannerDefaultBackground,
    removeBannerDefaultBackground,
    fetchSettings,
    getSetting,
  };
});
