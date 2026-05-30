import type { Episode } from '@/interfaces/api/models/Episode';
import type { CreateEpisodeRequest } from '@/interfaces/api/requests/CreateEpisodeRequest';
import type { UpdateEpisodeRequest } from '@/interfaces/api/requests/UpdateEpisodeRequest';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { showEpisodeService } from '../showEpisodeService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('showEpisodeService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists and gets episodes', async () => {
    const episodes: Episode[] = [
      {
        id: 21,
        show_entry_id: 10,
        name: 'Episode 1',
        filename: 'episode-1.mkv',
        sequence_number: 1,
      },
    ];

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(episodes))
      .mockResolvedValueOnce(createResponse(episodes[0]));

    await expect(showEpisodeService.list(10)).resolves.toEqual(episodes);
    await expect(showEpisodeService.get(21)).resolves.toEqual(episodes[0]);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'show-entries/10/episodes');
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'episodes/21');
  });

  it('creates and updates episodes', async () => {
    const createRequest: CreateEpisodeRequest = {
      name: 'Episode 2',
      filename: 'episode-2.mkv',
      sequence_number: 2,
    };
    const updateRequest: UpdateEpisodeRequest = {
      name: 'Episode 2 Director Cut',
      filename: 'episode-2-director-cut.mkv',
      sequence_number: 2,
    };
    const createdEpisode: Episode = {
      id: 22,
      show_entry_id: 10,
      name: 'Episode 2',
      filename: 'episode-2.mkv',
      sequence_number: 2,
    };
    const updatedEpisode: Episode = {
      id: 22,
      show_entry_id: 10,
      name: 'Episode 2 Director Cut',
      filename: 'episode-2-director-cut.mkv',
      sequence_number: 2,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(createdEpisode));
    vi.mocked(apiClient.put).mockResolvedValue(createResponse(updatedEpisode));

    await expect(showEpisodeService.create(10, createRequest)).resolves.toEqual(createdEpisode);
    await expect(showEpisodeService.update(22, updateRequest)).resolves.toEqual(updatedEpisode);

    expect(apiClient.post).toHaveBeenCalledWith('show-entries/10/episodes', createRequest);
    expect(apiClient.put).toHaveBeenCalledWith('episodes/22', updateRequest);
  });

  it('deletes episodes', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showEpisodeService.deleteEpisode(24)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('episodes/24');
  });
});
