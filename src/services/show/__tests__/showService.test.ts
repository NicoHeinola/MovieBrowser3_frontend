import type { Show } from '@/interfaces/api/models/Show';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateShowRequest } from '@/interfaces/api/requests/CreateShowRequest';
import type { UpdateShowRequest } from '@/interfaces/api/requests/UpdateShowRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { showService } from '../showService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const createShow = (overrides: Partial<Show> = {}): Show => ({
  id: 1,
  banner_url: 'banner.jpg',
  card_image_url: 'card.jpg',
  preview_url: null,
  description: 'A show',
  titles: [],
  entries: [],
  outgoing_links: [],
  incoming_links: [],
  ...overrides,
});

describe('showService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists shows with query params', async () => {
    const query: ApiQueryParams = {
      sort: '-created_at',
      filter: {
        search: 'gundam',
      },
      page: {
        number: 2,
        size: 12,
      },
    };
    const response: PaginatedResponse<Show> = {
      data: [createShow()],
      meta: {
        current_page: 2,
        last_page: 4,
        per_page: 12,
        total: 48,
      },
    };

    vi.mocked(apiClient.get).mockResolvedValue(createResponse(response));

    const result = await showService.list(query);

    expect(result).toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith('shows', {
      params: query,
    });
  });

  it('gets, creates, and updates shows without nested title payloads', async () => {
    const show: Show = createShow({
      id: 8,
      preview_url: 'https://youtu.be/example',
      description: 'A classic mecha series.',
    });
    const createRequest: CreateShowRequest = {
      banner_url: 'banner.jpg',
      card_image_url: 'card.jpg',
      preview_url: 'https://youtu.be/example',
      description: 'A classic mecha series.',
    };
    const updateRequest: UpdateShowRequest = {
      preview_url: null,
      description: 'An updated description.',
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(show));
    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(show));
    vi.mocked(apiClient.patch).mockResolvedValueOnce(createResponse(show));

    await expect(showService.get(8)).resolves.toEqual(show);
    await expect(showService.create(createRequest)).resolves.toEqual(show);
    await expect(showService.update(8, updateRequest)).resolves.toEqual(show);

    expect(apiClient.get).toHaveBeenCalledWith('shows/8');
    expect(apiClient.post).toHaveBeenCalledWith(
      'shows',
      expect.objectContaining({
        banner_url: createRequest.banner_url,
        card_image_url: createRequest.card_image_url,
        preview_url: createRequest.preview_url,
        description: createRequest.description,
      }),
    );
    expect(apiClient.post).toHaveBeenCalledWith('shows', expect.not.objectContaining({ titles: expect.anything() }));
    expect(apiClient.patch).toHaveBeenCalledWith(
      'shows/8',
      expect.objectContaining({
        preview_url: updateRequest.preview_url,
        description: updateRequest.description,
      }),
    );
    expect(apiClient.patch).toHaveBeenCalledWith('shows/8', expect.not.objectContaining({ titles: expect.anything() }));
  });
});
