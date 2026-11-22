import type { MalAnime } from '@/interfaces/api/models/MalAnime';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { malAnimeService } from '../malAnimeService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('malAnimeService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('searches with the name as the search filter', async () => {
    const response: ListResponse<MalAnime> = {
      data: [
        {
          id: 50_265,
          title: 'Spy x Family',
          url: 'https://myanimelist.net/anime/50265/Spy_x_Family',
          image_url: 'https://cdn.myanimelist.net/r/116x180/images/anime/1441/122795.jpg',
          media_type: 'TV',
          start_year: 2022,
          status: 'Finished Airing',
          score: '8.40',
        },
      ],
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: response });

    await expect(malAnimeService.list('spy x')).resolves.toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith('mal-anime', { params: { filter: { search: 'spy x' } } });
  });
});
