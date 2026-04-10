import type { SettingsResponse } from '@/interfaces/api/models/SettingsResponse';

import { apiClient } from '@/plugins/api/apiClient';

export const settingService = {
  getSettings: async (): Promise<SettingsResponse> => {
    const { data } = await apiClient.get<SettingsResponse>('/settings');
    return data;
  },
};
