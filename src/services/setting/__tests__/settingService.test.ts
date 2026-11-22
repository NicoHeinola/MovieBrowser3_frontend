import type { SettingsResponse } from '@/interfaces/api/responses/SettingsResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingKey } from '@/enums/setting/SettingKey';
import { apiClient } from '@/plugins/api/apiClient';

import { settingService } from '../settingService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('settingService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists the settings', async () => {
    const settings: SettingsResponse = {
      data: [{ key: SettingKey.VlcMediaPlayerPath, value: 'vlc', type: 'string', updated_at: null }],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(settings));

    await expect(settingService.list()).resolves.toEqual(settings);

    expect(apiClient.get).toHaveBeenCalledWith('settings');
  });

  it('updates one setting by its key', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce(createResponse(undefined));

    await settingService.update(SettingKey.BannerDefaultVideos, { value: ['https://youtu.be/abc'] });

    expect(apiClient.patch).toHaveBeenCalledWith('settings/banner_default_videos', {
      value: ['https://youtu.be/abc'],
    });
  });
});
