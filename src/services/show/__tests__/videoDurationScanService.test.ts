import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { videoDurationScanService } from '../videoDurationScanService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const status = {
  running: true,
  read: 10,
  total: 40,
  finished_at: null,
  error: null,
  unknown_durations_count: 0,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('videoDurationScanService', () => {
  it('reads the status', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(createResponse(status));

    await expect(videoDurationScanService.get()).resolves.toEqual(status);
    expect(apiClient.get).toHaveBeenCalledWith('video-files/duration-scan');
  });

  it('queues every episode by default and returns the status', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(createResponse(status));

    await expect(videoDurationScanService.start()).resolves.toEqual(status);
    expect(apiClient.post).toHaveBeenCalledWith('video-files/duration-scan', {});
  });

  it('queues only the given shows', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(createResponse(status));

    await videoDurationScanService.start({ show_ids: [3, 5] });

    expect(apiClient.post).toHaveBeenCalledWith('video-files/duration-scan', { show_ids: [3, 5] });
  });
});
