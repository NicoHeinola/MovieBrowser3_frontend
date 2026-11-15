import type { SettingValues } from '@/interfaces/api/models/SettingValues';
import type { UpdateSettingRequest } from '@/interfaces/api/requests/UpdateSettingRequest';
import type { SettingsResponse } from '@/interfaces/api/responses/SettingsResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (): Promise<SettingsResponse> => {
  const response = await apiClient.get<SettingsResponse>('settings');

  return response.data;
};

const update = async <K extends keyof SettingValues>(
  key: K,
  request: UpdateSettingRequest<SettingValues[K]>,
): Promise<void> => {
  await apiClient.patch(`settings/${key}`, request);
};

export const settingService = {
  list,
  update,
};
