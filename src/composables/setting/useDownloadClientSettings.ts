import type { SettingValues } from '@/interfaces/api/models/SettingValues';
import type { SetupChecks } from '@/interfaces/api/models/SetupChecks';
import type { SetupCheckRequest } from '@/interfaces/api/requests/SetupCheckRequest';
import type { DownloadClientRequest } from '@/interfaces/setting/DownloadClientRequest';

import { computed, ref, watch } from 'vue';

import { SettingKey } from '@/enums/setting/SettingKey';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { useSetupStore } from '@/stores/setup/useSetupStore';

/**
 * Edits the qBittorrent connection and download folder: a draft that follows the saved settings, and a save that logs
 * in to qBittorrent and checks the folder first.
 * @returns The draft, the last checks, whether a password is saved, and the save action.
 */
export const useDownloadClientSettings = () => {
  const request = ref<DownloadClientRequest>({ url: '', username: '', password: '', downloadPath: '' });
  /** The last checks' results, so the form can say what failed. Cleared once the value they judged is edited. */
  const checks = ref<SetupChecks>({});
  const isSaving = ref<boolean>(false);

  const settingStore = useSettingStore();
  const setupStore = useSetupStore();

  const savedUrl = computed<string>(() => settingStore.getSetting(SettingKey.QBittorrentUrl) ?? '');
  const savedUsername = computed<string>(() => settingStore.getSetting(SettingKey.QBittorrentUsername) ?? '');
  const savedDownloadPath = computed<string>(() => settingStore.getSetting(SettingKey.DownloadPath) ?? '');
  const isPasswordSaved = computed<boolean>(() => settingStore.isSettingSet(SettingKey.QBittorrentPassword));

  /**
   * The draft's values that differ from the saved ones. The password counts only when one was typed.
   * @returns The settings to save.
   */
  const getChangedValues = (): Partial<SettingValues> => {
    const { url, username, password, downloadPath } = request.value;
    const changedValues: Partial<SettingValues> = {};

    if (url.trim() !== savedUrl.value) {
      changedValues[SettingKey.QBittorrentUrl] = url.trim();
    }

    if (username.trim() !== savedUsername.value) {
      changedValues[SettingKey.QBittorrentUsername] = username.trim();
    }

    if (password !== '') {
      changedValues[SettingKey.QBittorrentPassword] = password;
    }

    if (downloadPath.trim() !== savedDownloadPath.value) {
      changedValues[SettingKey.DownloadPath] = downloadPath.trim();
    }

    return changedValues;
  };

  /**
   * Logs in to qBittorrent and checks the folder, then saves what changed. Turning downloads off (no address) needs no
   * check. Every call checks again, so the admin can retry after starting qBittorrent.
   * @returns Whether it saved: `false` when a check failed or a save is already running. Throws when a request fails.
   */
  const save = async (): Promise<boolean> => {
    // Enter still submits while the button shows as loading, and a second run would save twice.
    if (isSaving.value) {
      return false;
    }

    isSaving.value = true;
    checks.value = {};

    try {
      const { url, username, password, downloadPath } = request.value;

      if (url.trim() !== '') {
        const checkRequest: SetupCheckRequest = {
          [SettingKey.QBittorrentUrl]: url.trim(),
          [SettingKey.QBittorrentUsername]: username.trim(),
          [SettingKey.DownloadPath]: downloadPath.trim(),
        };

        // Left out, the backend logs in with the saved password.
        if (password !== '') {
          checkRequest[SettingKey.QBittorrentPassword] = password;
        }

        checks.value = await setupStore.checkSettings(checkRequest);

        if (Object.values(checks.value).some((check) => check?.ok === false)) {
          return false;
        }
      }

      await settingStore.updateSettings(getChangedValues());
      request.value.password = '';

      return true;
    } finally {
      isSaving.value = false;
    }
  };

  // Each draft field follows only its own saved value, so saving one field doesn't wipe an unsaved edit of another.
  watch(
    savedUrl,
    (value: string) => {
      request.value.url = value;
    },
    { immediate: true },
  );

  watch(
    savedUsername,
    (value: string) => {
      request.value.username = value;
    },
    { immediate: true },
  );

  watch(
    savedDownloadPath,
    (value: string) => {
      request.value.downloadPath = value;
    },
    { immediate: true },
  );

  // An edited value hasn't been checked yet, so the old reason no longer applies.
  watch(
    () => [request.value.url, request.value.username, request.value.password],
    () => {
      delete checks.value[SettingKey.QBittorrentUrl];
    },
  );

  watch(
    () => request.value.downloadPath,
    () => {
      delete checks.value[SettingKey.DownloadPath];
    },
  );

  return {
    request,
    checks,
    isSaving,
    isPasswordSaved,
    save,
  };
};
