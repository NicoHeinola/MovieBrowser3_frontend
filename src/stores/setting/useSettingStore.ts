import type { Setting } from '@/interfaces/api/models/Setting';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SettingQueryKey } from '@/enums/query/settingQueryKey';
import { queryClient } from '@/plugins/query';
import { settingService } from '@/services/setting/settingService';

type SettingsState = Record<string, Setting>;

/**
 * Normalize the paginated settings response into a keyed lookup object for easier access in the store and components.
 * @param response The raw paginated settings response from the backend.
 * @returns A normalized settings state object keyed by setting keys.
 */
const normalizeSettings = (response: Awaited<ReturnType<typeof settingService.getSettings>>): SettingsState => {
  return response.data.reduce<SettingsState>((settingsByKey: SettingsState, setting: Setting) => {
    settingsByKey[setting.key] = setting;
    return settingsByKey;
  }, {});
};

export const useSettingStore = defineStore('setting', () => {
  const settings = ref<SettingsState>({});
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
      const response = await queryClient.ensureQueryData({
        queryKey: [SettingQueryKey.Settings],
        queryFn: settingService.getSettings,
      });

      settings.value = normalizeSettings(response);
    } finally {
      isLoading.value = false;
    }
  };

  const addSettingArrayItem = async (key: string, value: string): Promise<void> => {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      return;
    }

    const values = getSetting<string[]>(key) ?? [];

    await updateSetting(key, [...values, trimmedValue]);
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

    await updateSetting(key, nextValues);
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

  const updateSetting = async (key: string, value: unknown): Promise<void> => {
    await settingService.updateSetting(key, { value });

    await queryClient.resetQueries({ queryKey: [SettingQueryKey.Settings] });
    await fetchSettings();
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
    updateSetting,
  };
});
