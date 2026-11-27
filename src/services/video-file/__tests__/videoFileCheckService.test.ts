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
    const status = { running: true, checked: 0, total: 900, finished_at: null, error: null };
    vi.mocked(apiClient.post).mockResolvedValue(createResponse(status));

    await expect(videoFileCheckService.start()).resolves.toEqual(status);
    expect(apiClient.post).toHaveBeenCalledWith('video-files/check');
  });

  it("checks one show and returns its files' problems", async () => {
    const problems = { missing_video_files_count: 2, unknown_video_durations_count: 0 };
    vi.mocked(apiClient.post).mockResolvedValue(createResponse(problems));

    await expect(videoFileCheckService.checkShow(4)).resolves.toEqual(problems);
    expect(apiClient.post).toHaveBeenCalledWith('shows/4/video-file-check', null, { timeout: 60_000 });
  });
});
