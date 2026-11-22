import type { SetupCheckResult } from '@/interfaces/api/models/SetupCheckResult';
import type { SetupChecks } from '@/interfaces/api/models/SetupChecks';
import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';
import type { SetupCheckRequest } from '@/interfaces/api/requests/SetupCheckRequest';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { setupService } from '@/services/setup/setupService';

export const useSetupStore = defineStore('setup', () => {
  const status = ref<SetupStatus | null>(null);
  const isLoading = ref<boolean>(false);
  /** Skipping lasts for this browser session only, so admins are asked again on their next visit until it's done. */
  const isSkipped = useStorage<boolean>('setup.skipped', false, sessionStorage);

  const isCompleted = computed<boolean>(() => Boolean(status.value?.completed_at));

  /**
   * Loads the setup status from the backend, replacing any loaded copy.
   * @returns The loaded status.
   */
  const fetchStatus = async (): Promise<SetupStatus> => {
    isLoading.value = true;
    try {
      status.value = await setupService.get();

      return status.value;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Tells the router whether to send an admin to the setup wizard. Loads the status only once, since only the wizard
   * changes it.
   * @returns `true` while setup is not done and has not been skipped in this session.
   */
  const isSetupDue = async (): Promise<boolean> => {
    if (isSkipped.value) {
      return false;
    }

    const loadedStatus = status.value ?? (await fetchStatus());

    return loadedStatus.completed_at === null;
  };

  /**
   * Checks setup values without saving them. The caller saves the values that passed.
   * @param request - The values to check; the ones left out are not checked.
   * @returns One result per checked value.
   */
  const checkSettings = async (request: SetupCheckRequest): Promise<SetupChecks> => {
    return await setupService.check(request);
  };

  /**
   * Checks a setup path without saving it. The caller saves a path that passed, because the video folder moves through
   * a relocation while other paths are plain settings.
   * @param key - The setting the path is for; the backend checks it under the same key.
   * @param path - The path to check.
   * @returns The check's result, or `null` when the backend didn't check this key.
   */
  const checkPath = async (key: keyof SetupChecks, path: string): Promise<SetupCheckResult | null> => {
    const checks = await checkSettings({ [key]: path });

    return checks[key] ?? null;
  };

  /**
   * Marks setup as done on the backend.
   * @returns Nothing.
   */
  const complete = async (): Promise<void> => {
    isLoading.value = true;
    try {
      status.value = await setupService.complete();
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Stops sending this admin to the setup wizard for the rest of the browser session.
   * @returns Nothing.
   */
  const skip = (): void => {
    isSkipped.value = true;
  };

  /**
   * Forgets the loaded status and a skip, so the next admin to log in in this tab is asked again.
   * @returns Nothing.
   */
  const reset = (): void => {
    status.value = null;
    isSkipped.value = false;
  };

  return {
    status,
    isLoading,
    isSkipped,
    isCompleted,
    fetchStatus,
    isSetupDue,
    checkSettings,
    checkPath,
    complete,
    skip,
    reset,
  };
});
