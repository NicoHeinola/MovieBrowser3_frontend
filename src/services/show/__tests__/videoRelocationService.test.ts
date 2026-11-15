import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { videoRelocationService } from '../videoRelocationService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const status = {
  running: true,
  reverting: false,
  moved: 12,
  total: 340,
  from_path: '/old/videos',
  to_path: '/new/videos',
  finished_at: null,
  error: null,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('videoRelocationService', () => {
  it('reads the status', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(createResponse(status));

    await expect(videoRelocationService.get()).resolves.toEqual(status);
    expect(apiClient.get).toHaveBeenCalledWith('video-files/relocation');
  });

  it('starts the move and returns its status', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(createResponse(status));

    await expect(videoRelocationService.start({ video_base_path: '/new/videos' })).resolves.toEqual(status);
    expect(apiClient.post).toHaveBeenCalledWith('video-files/relocation', { video_base_path: '/new/videos' });
  });
});
