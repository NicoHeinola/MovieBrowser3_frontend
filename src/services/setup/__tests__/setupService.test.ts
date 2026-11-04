import type { SetupChecks } from '@/interfaces/api/models/SetupChecks';
import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SetupCheckCode } from '@/enums/setup/SetupCheckCode';
import { apiClient } from '@/plugins/api/apiClient';

import { setupService } from '../setupService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const createStatus = (completedAt: string | null): SetupStatus => ({
  completed_at: completedAt,
  media_folders: ['/mnt/g/New_Vid'],
  detected_vlc_media_player_path: '/mnt/c/Program Files/VideoLAN/VLC/vlc.exe',
});

describe('setupService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('gets the setup status', async () => {
    const status = createStatus(null);

    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(status));

    await expect(setupService.get()).resolves.toEqual(status);
    expect(apiClient.get).toHaveBeenCalledWith('setup');
  });

  it('checks only the paths it is given', async () => {
    const checks: SetupChecks = {
      vlc_media_player_path: { ok: false, code: SetupCheckCode.VlcNotFound, params: { path: '/usr/bin/vlc' } },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(checks));

    await expect(setupService.check({ vlc_media_player_path: '/usr/bin/vlc' })).resolves.toEqual(checks);
    expect(apiClient.post).toHaveBeenCalledWith('setup/checks', { vlc_media_player_path: '/usr/bin/vlc' });
  });

  it('completes the setup', async () => {
    const status = createStatus('2026-11-01T12:00:00.000000Z');

    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(status));

    await expect(setupService.complete()).resolves.toEqual(status);
    expect(apiClient.post).toHaveBeenCalledWith('setup/complete');
  });
});
