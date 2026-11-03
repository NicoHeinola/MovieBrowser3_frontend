import type { AppVersion } from '@/interfaces/api/models/AppVersion';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Gets the running backend version and the newest released versions of both halves of the app.
 * @returns The app version.
 */
const get = async (): Promise<AppVersion> => {
  const response = await apiClient.get<AppVersion>('app-version');

  return response.data;
};

export const appVersionService = {
  get,
};
