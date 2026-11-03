import type { AppVersion } from '@/interfaces/api/models/AppVersion';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { appVersionService } from '../appVersionService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('appVersionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('gets the app version', async () => {
    const appVersion: AppVersion = {
      backend: { current: '1.1.0', latest: '1.2.0', release_url: 'https://example.com/backend' },
      frontend: { latest: null, release_url: null },
      checked_at: '2026-11-03T10:00:00.000000Z',
    };
    vi.mocked(apiClient.get).mockResolvedValue(createResponse(appVersion));

    await expect(appVersionService.get()).resolves.toEqual(appVersion);
    expect(apiClient.get).toHaveBeenCalledWith('app-version');
  });
});
