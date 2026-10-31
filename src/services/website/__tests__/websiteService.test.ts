import type { Website } from '@/interfaces/api/models/Website';
import type { CreateWebsiteRequest } from '@/interfaces/api/requests/CreateWebsiteRequest';
import type { UpdateWebsiteRequest } from '@/interfaces/api/requests/UpdateWebsiteRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { websiteService } from '../websiteService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const createWebsite = (overrides: Partial<Website> = {}): Website => ({
  id: 3,
  url: 'https://vuetifyjs.com',
  title: 'Vuetify',
  icon: 'mdi-vuetify',
  description: null,
  tags: [{ id: 8, name: 'docs' }],
  created_at: '2026-10-31T12:00:00.000000Z',
  updated_at: '2026-10-31T12:00:00.000000Z',
  ...overrides,
});

describe('websiteService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists and gets websites', async () => {
    const website = createWebsite();
    const paginated: PaginatedResponse<Website> = {
      data: [website],
      meta: { current_page: 1, last_page: 1, per_page: 0, total: 1 },
    };
    const query = {
      filter: { 'tags.id': ['8'] },
      sort: 'title',
      page: { number: 0, size: 0 },
    };

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(paginated))
      .mockResolvedValueOnce(createResponse(website));

    await expect(websiteService.list(query)).resolves.toEqual(paginated);
    await expect(websiteService.get(3)).resolves.toEqual(website);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'websites', { params: query });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'websites/3');
  });

  it('creates and updates websites', async () => {
    const createRequest: CreateWebsiteRequest = {
      url: 'https://vuetifyjs.com',
      title: 'Vuetify',
      icon: null,
      description: null,
      tag_ids: [8, 9],
    };
    const updateRequest: UpdateWebsiteRequest = {
      title: 'Vuetify docs',
      tag_ids: [],
    };
    const createdWebsite = createWebsite({ icon: null });
    const updatedWebsite = createWebsite({ title: 'Vuetify docs', tags: [] });

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(createdWebsite));
    vi.mocked(apiClient.patch).mockResolvedValue(createResponse(updatedWebsite));

    await expect(websiteService.create(createRequest)).resolves.toEqual(createdWebsite);
    await expect(websiteService.update(3, updateRequest)).resolves.toEqual(updatedWebsite);

    expect(apiClient.post).toHaveBeenCalledWith('websites', createRequest);
    expect(apiClient.patch).toHaveBeenCalledWith('websites/3', updateRequest);
  });

  it('deletes websites', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(websiteService.remove(3)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('websites/3');
  });
});
