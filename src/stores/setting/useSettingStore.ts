import type { Setting } from '@/interfaces/api/models/Setting';
import type { SettingValues } from '@/interfaces/api/models/SettingValues';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SettingQueryKey } from '@/enums/query/settingQueryKey';
import { SettingKey } from '@/enums/setting/SettingKey';
import { queryClient } from '@/plugins/query';
import { settingService } from '@/services/setting/settingService';

/** Loaded settings by key. Keeps keys this build doesn't know, since the backend may send more than it reads. */
type SettingsState = Record<string, Setting>;

/** The settings whose value is a list of strings. */
type ListSettingKey = {
  [K in keyof SettingValues]: SettingValues[K] extends string[] ? K : never;
}[keyof SettingValues];

/**
 * Normalize the paginated settings response into a keyed lookup object for easier access in the store and components.
 * @param response The raw paginated settings response from the backend.
 * @returns A normalized settings state object keyed by setting keys.
 */
const normalizeSettings = (response: Awaited<ReturnType<typeof settingService.list>>): SettingsState => {
  return response.data.reduce<SettingsState>((settingsByKey: SettingsState, setting: Setting) => {
    settingsByKey[setting.key] = setting;
    return settingsByKey;
  }, {});
};

export const useSettingStore = defineStore('setting', () => {
  const settings = ref<SettingsState>({});
  const isLoading = ref<boolean>(false);

  /** Whether the settings have loaded once. A reload keeps the old values, so only the first load has none to show. */
  const hasLoaded = computed<boolean>(() => Object.keys(settings.value).length > 0);

  /**
   * Reads a loaded setting's value.
   * @param key - The setting to read.
   * @returns Its value, or undefined when it hasn't loaded.
   */
  const getSetting = <K extends keyof SettingValues>(key: K): SettingValues[K] | undefined => {
    // The backend sends values as untyped JSON; SettingValues says what each key holds.
    return settings.value[key]?.value as SettingValues[K] | undefined;
  };

  const bannerDefaultVideos = computed<string[]>(() => getSetting(SettingKey.BannerDefaultVideos) ?? []);

  const bannerDefaultBackgrounds = computed<string[]>(() => getSetting(SettingKey.BannerDefaultBackgrounds) ?? []);

  const fetchSettings = async (): Promise<void> => {
    isLoading.value = true;
    try {
      // 'static' keeps cached settings without refetching; reloadSettings resets the query to force a fetch.
      const response = await queryClient.query({
        queryKey: [SettingQueryKey.Settings],
        queryFn: settingService.list,
        staleTime: 'static',
      });

      settings.value = normalizeSettings(response);
    } finally {
      isLoading.value = false;
    }
  };

  const addSettingArrayItem = async (key: ListSettingKey, value: string): Promise<void> => {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      return;
    }

    const values = getSetting(key) ?? [];

    await updateSetting(key, [...values, trimmedValue]);
  };

  const removeSettingArrayItem = async (key: ListSettingKey, value: string): Promise<void> => {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      return;
    }

    const values = getSetting(key) ?? [];
    const nextValues = values.filter((existingValue: string) => existingValue !== trimmedValue);

    if (nextValues.length === values.length) {
      return;
    }

    await updateSetting(key, nextValues);
  };

  const addBannerDefaultBackground = async (url: string): Promise<void> => {
    await addSettingArrayItem(SettingKey.BannerDefaultBackgrounds, url);
  };

  const removeBannerDefaultBackground = async (url: string): Promise<void> => {
    await removeSettingArrayItem(SettingKey.BannerDefaultBackgrounds, url);
  };

  const addBannerDefaultVideo = async (url: string): Promise<void> => {
    await addSettingArrayItem(SettingKey.BannerDefaultVideos, url);
  };

  const removeBannerDefaultVideo = async (url: string): Promise<void> => {
    await removeSettingArrayItem(SettingKey.BannerDefaultVideos, url);
  };

  /**
   * Loads the settings again from the backend, skipping the cached copy, after something changed them.
   * @returns Nothing.
   */
  const reloadSettings = async (): Promise<void> => {
    await queryClient.resetQueries({ queryKey: [SettingQueryKey.Settings] });
    await fetchSettings();
  };

  /**
   * Forgets the loaded settings, such as on logout, since reading them needs a login.
   * @returns Nothing.
   */
  const clearSettings = (): void => {
    settings.value = {};
  };

  /**
   * Whether a secret setting holds a value. Secrets read back as `null`, so this is all the frontend learns of them.
   * @param key - The setting.
   * @returns Whether a value is saved.
   */
  const isSettingSet = (key: keyof SettingValues): boolean => {
    return settings.value[key]?.is_set ?? false;
  };

  /**
   * Saves several settings, then loads the settings once.
   * @param values - The settings to save; the ones left out keep their value.
   * @returns Nothing.
   */
  const updateSettings = async (values: Partial<SettingValues>): Promise<void> => {
    try {
      // One after another: the backend validates each on its own, and a failure stops the rest.
      for (const key of Object.keys(values) as (keyof SettingValues)[]) {
        await settingService.update(key, { value: values[key] as SettingValues[typeof key] });
      }
    } finally {
      // Values saved before a failure stay saved, so the form must show them.
      await reloadSettings();
    }
  };

  /**
   * Saves a setting and loads the settings again.
   * @param key - The setting to save.
   * @param value - Its new value.
   * @returns Nothing.
   */
  const updateSetting = async <K extends keyof SettingValues>(key: K, value: SettingValues[K]): Promise<void> => {
    await settingService.update(key, { value });
    await reloadSettings();
  };

  return {
    settings,
    isLoading,
    hasLoaded,
    bannerDefaultVideos,
    bannerDefaultBackgrounds,
    addBannerDefaultVideo,
    addBannerDefaultBackground,
    removeBannerDefaultVideo,
    removeBannerDefaultBackground,
    fetchSettings,
    reloadSettings,
    clearSettings,
    getSetting,
    isSettingSet,
    updateSetting,
    updateSettings,
  };
});
