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
      sequence_number: 2,
    };
    const updateRequest: UpdateEpisodeRequest = {
      name: 'Episode 2 Director Cut',
      sequence_number: 2,
    };
    const createdEpisode: Episode = {
      id: 22,
      show_entry_id: 10,
      name: 'Episode 2',
      sequence_number: 2,
    };
    const updatedEpisode: Episode = {
      id: 22,
      show_entry_id: 10,
      name: 'Episode 2 Director Cut',
      sequence_number: 2,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(createdEpisode));
    vi.mocked(apiClient.put).mockResolvedValue(createResponse(updatedEpisode));

    await expect(showEpisodeService.create(10, createRequest)).resolves.toEqual(createdEpisode);
    await expect(showEpisodeService.update(22, updateRequest)).resolves.toEqual(updatedEpisode);

    const postCall = vi.mocked(apiClient.post).mock.calls[0];

    expect(postCall?.[0]).toBe('show-entries/10/episodes');
    expect(postCall?.[1]).toBeInstanceOf(FormData);
    expect(postCall?.[2]).toEqual({
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const formData = postCall?.[1] as FormData;
    expect(formData.get('name')).toBe('Episode 2');
    expect(formData.get('sequence_number')).toBe('2');
    expect(formData.has('file')).toBe(false);

    expect(apiClient.put).toHaveBeenCalledWith('episodes/22', updateRequest);
  });

  it('deletes episodes', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showEpisodeService.remove(24)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('episodes/24');
  });
});
