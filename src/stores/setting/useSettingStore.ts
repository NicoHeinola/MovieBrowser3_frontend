import type { SettingsResponse } from '@/interfaces/api/models/SettingsResponse';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SettingQueryKey } from '@/enums/query/settingQueryKey';
import { queryClient } from '@/plugins/query';
import { settingService } from '@/services/setting/settingService';

export const useSettingStore = defineStore('setting', () => {
  const settings = ref<SettingsResponse>({});
  const isLoading = ref<boolean>(false);

  const getSettingValue = <T>(key: string, fallbackValue: T): T => {
    const settingValue = settings.value[key]?.value;

    if (settingValue === undefined) {
      return fallbackValue;
    }

    return settingValue as T;
  };

  const bannerDefaultVideos = computed<string[]>(() => {
    return getSettingValue<string[]>('banner_default_videos', []);
  });

  const bannerDefaultBackgrounds = computed<string[]>(() => {
    return getSettingValue<string[]>('banner_default_backgrounds', []);
  });

  const fetchSettings = async (): Promise<void> => {
    isLoading.value = true;
    try {
      settings.value = await queryClient.ensureQueryData({
        queryKey: [SettingQueryKey.Settings],
        queryFn: settingService.getSettings,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const updateSettingArray = async (key: string, values: string[]): Promise<void> => {
    await settingService.updateSetting(key, {
      value: values,
    });

    await queryClient.resetQueries({ queryKey: [SettingQueryKey.Settings] });
    await fetchSettings();
  };

  const addSettingArrayItem = async (key: string, value: string): Promise<void> => {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      return;
    }

    const values = getSetting<string[]>(key) ?? [];

    await updateSettingArray(key, [...values, trimmedValue]);
  };

  const removeSettingArrayItem = async (key: string, value: string): Promise<void> => {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      return;
    }

    const values = getSetting<string[]>(key) ?? [];
    const nextValues = values.filter((existingValue: string) => existingValue !== trimmedValue);

    if (nextValues.length === values.length) {
      return;
    }

    await updateSettingArray(key, nextValues);
  };

  const addBannerDefaultBackground = async (url: string): Promise<void> => {
    await addSettingArrayItem('banner_default_backgrounds', url);
  };

  const removeBannerDefaultBackground = async (url: string): Promise<void> => {
    await removeSettingArrayItem('banner_default_backgrounds', url);
  };

  const addBannerDefaultVideo = async (url: string): Promise<void> => {
    await addSettingArrayItem('banner_default_videos', url);
  };

  const removeBannerDefaultVideo = async (url: string): Promise<void> => {
    await removeSettingArrayItem('banner_default_videos', url);
  };

  const getSetting = <T = unknown>(key: string): T | undefined => {
    return settings.value[key]?.value as T;
  };

  return {
    settings,
    isLoading,
    bannerDefaultVideos,
    bannerDefaultBackgrounds,
    addBannerDefaultVideo,
    addBannerDefaultBackground,
    removeBannerDefaultVideo,
    removeBannerDefaultBackground,
    fetchSettings,
    getSetting,
  };
});
