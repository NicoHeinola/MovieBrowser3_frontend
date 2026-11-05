import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { videoFileCheckService } from '../videoFileCheckService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('videoFileCheckService', () => {
  it('reads the status', async () => {
    const status = { running: true, checked: 200, total: 900, finished_at: null, error: null };
    vi.mocked(apiClient.get).mockResolvedValue(createResponse(status));

    await expect(videoFileCheckService.get()).resolves.toEqual(status);
    expect(apiClient.get).toHaveBeenCalledWith('video-files/check');
  });

  it('queues the check', async () => {
    await videoFileCheckService.start();

    expect(apiClient.post).toHaveBeenCalledWith('video-files/check');
  });
});
