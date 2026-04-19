import type { UpdateSettingRequest } from '@/interfaces/api/requests/UpdateSettingRequest';
import type { SettingsResponse } from '@/interfaces/api/responses/SettingsResponse';

import { apiClient } from '@/plugins/api/apiClient';

const getSettings = async (): Promise<SettingsResponse> => {
  const { data } = await apiClient.get<SettingsResponse>('/settings');
  return data;
};

const updateSetting = async <T>(key: string, request: UpdateSettingRequest<T>): Promise<void> => {
  await apiClient.patch(`/settings/${key}`, request);
};

export const settingService = {
  getSettings,
  updateSetting,
};
