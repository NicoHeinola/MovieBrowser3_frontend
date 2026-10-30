import type { UpdateSettingRequest } from '@/interfaces/api/requests/UpdateSettingRequest';
import type { SettingsResponse } from '@/interfaces/api/responses/SettingsResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (): Promise<SettingsResponse> => {
  const response = await apiClient.get<SettingsResponse>('settings');

  return response.data;
};

const update = async <T>(key: string, request: UpdateSettingRequest<T>): Promise<void> => {
  await apiClient.patch(`settings/${key}`, request);
};

export const settingService = {
  list,
  update,
};
