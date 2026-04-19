import type { ShowTitle } from '@/interfaces/api/models/ShowTitle';
import type { CreateShowTitleRequest } from '@/interfaces/api/requests/CreateShowTitleRequest';
import type { ListShowTitlesRequest } from '@/interfaces/api/requests/ListShowTitlesRequest';
import type { UpdateShowTitleRequest } from '@/interfaces/api/requests/UpdateShowTitleRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { showTitleService } from '../showTitleService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const createShowTitle = (overrides: Partial<ShowTitle> = {}): ShowTitle => ({
  id: 1,
  show_id: 1,
  title: 'Mobile Suit Gundam',
  is_primary: true,
  created_at: '2026-04-19T00:00:00Z',
  updated_at: '2026-04-19T00:00:00Z',
  ...overrides,
});

describe('showTitleService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists show titles with query params', async () => {
    const query: ListShowTitlesRequest = {
      filter: {
        title: 'gundam',
        show_id: 4,
        is_primary: true,
      },
      sort: '-updated_at',
      page: {
        number: 1,
        size: 50,
      },
    };
    const response: PaginatedResponse<ShowTitle> = {
      data: [createShowTitle({ id: 19, show_id: 4 })],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: 1,
      },
    };

    vi.mocked(apiClient.get).mockResolvedValue(createResponse(response));

    const result = await showTitleService.list(4, query);

    expect(result).toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith('shows/4/titles', {
      params: query,
    });
  });

  it('gets, creates, updates, and deletes a show title', async () => {
    const title = createShowTitle({
      id: 19,
      show_id: 4,
    });
    const createRequest: CreateShowTitleRequest = {
      title: 'Kidou Senshi Gundam',
      is_primary: false,
    };
    const updateRequest: UpdateShowTitleRequest = {
      is_primary: true,
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(title));
    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(title));
    vi.mocked(apiClient.patch).mockResolvedValueOnce(createResponse(title));
    vi.mocked(apiClient.delete).mockResolvedValueOnce(createResponse(undefined));

    await expect(showTitleService.get(19)).resolves.toEqual(title);
    await expect(showTitleService.create(4, createRequest)).resolves.toEqual(title);
    await expect(showTitleService.update(19, updateRequest)).resolves.toEqual(title);
    await expect(showTitleService.remove(19)).resolves.toBeUndefined();

    expect(apiClient.get).toHaveBeenCalledWith('titles/19');
    expect(apiClient.post).toHaveBeenCalledWith('shows/4/titles', createRequest);
    expect(apiClient.patch).toHaveBeenCalledWith('titles/19', updateRequest);
    expect(apiClient.delete).toHaveBeenCalledWith('titles/19');
  });
});
