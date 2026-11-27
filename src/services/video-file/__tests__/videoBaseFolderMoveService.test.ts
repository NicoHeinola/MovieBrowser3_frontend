import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { videoBaseFolderMoveService } from '../videoBaseFolderMoveService';

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

describe('videoBaseFolderMoveService', () => {
  it('reads the status', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(createResponse(status));

    await expect(videoBaseFolderMoveService.get()).resolves.toEqual(status);
    expect(apiClient.get).toHaveBeenCalledWith('video-files/move');
  });

  it('starts the move and returns its status', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(createResponse(status));

    await expect(videoBaseFolderMoveService.start({ video_base_folder: '/new/videos' })).resolves.toEqual(status);
    expect(apiClient.post).toHaveBeenCalledWith('video-files/move', { video_base_folder: '/new/videos' });
  });
});
