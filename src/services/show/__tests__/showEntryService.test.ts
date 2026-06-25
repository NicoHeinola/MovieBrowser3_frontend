import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { CreateShowEntryRequest } from '@/interfaces/api/requests/CreateShowEntryRequest';
import type { UpdateShowEntryRequest } from '@/interfaces/api/requests/UpdateShowEntryRequest';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { apiClient } from '@/plugins/api/apiClient';

import { showEntryService } from '../showEntryService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('showEntryService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists and gets show entries', async () => {
    const entries: ShowEntry[] = [
      {
        id: 10,
        show_id: 4,
        type: ShowEntryType.Season,
        name: 'Season 1',
        sort_order: 0,
        episodes: [],
      },
    ];

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(entries))
      .mockResolvedValueOnce(createResponse(entries[0]));

    await expect(showEntryService.list(4)).resolves.toEqual(entries);
    await expect(showEntryService.get(10)).resolves.toEqual(entries[0]);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'shows/4/entries');
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'entries/10');
  });

  it('creates and updates show entries', async () => {
    const createRequest: CreateShowEntryRequest = {
      type: ShowEntryType.Movie,
      name: 'Compilation Movie',
      sort_order: 3,
    };
    const updateRequest: UpdateShowEntryRequest = {
      type: ShowEntryType.TvSpecial,
      name: 'TV Special',
      sort_order: 4,
    };
    const createdEntry: ShowEntry = {
      id: 12,
      show_id: 7,
      type: ShowEntryType.Movie,
      name: 'Compilation Movie',
      sort_order: 3,
    };
    const updatedEntry: ShowEntry = {
      id: 12,
      show_id: 7,
      type: ShowEntryType.TvSpecial,
      name: 'TV Special',
      sort_order: 4,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(createdEntry));
    vi.mocked(apiClient.put).mockResolvedValue(createResponse(updatedEntry));

    await expect(showEntryService.create(7, createRequest)).resolves.toEqual(createdEntry);
    await expect(showEntryService.update(12, updateRequest)).resolves.toEqual(updatedEntry);

    expect(apiClient.post).toHaveBeenCalledWith('shows/7/entries', createRequest);
    expect(apiClient.put).toHaveBeenCalledWith('entries/12', updateRequest);
  });

  it('deletes show entries', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showEntryService.remove(9)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('entries/9');
  });
});
