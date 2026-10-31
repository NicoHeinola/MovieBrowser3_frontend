import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { episodePlaybackService } from '../episodePlaybackService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('episodePlaybackService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('starts playback of an episode', async () => {
    const progress: ShowWatchProgress = { show_id: 1, show_entry_id: 10, episode_id: 100, updated_at: '2026-10-30' };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(progress));

    await expect(episodePlaybackService.play(100)).resolves.toEqual(progress);

    expect(apiClient.post).toHaveBeenCalledWith('episodes/100/playback');
  });
});
