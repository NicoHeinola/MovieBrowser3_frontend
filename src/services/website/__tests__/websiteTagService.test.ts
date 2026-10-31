import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { websiteTagService } from '../websiteTagService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('websiteTagService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists and gets website tags', async () => {
    const tag: WebsiteTag = { id: 5, name: 'docs', websites_count: 2 };
    const paginated: PaginatedResponse<WebsiteTag> = {
      data: [tag],
      meta: { current_page: 1, last_page: 1, per_page: 0, total: 1 },
    };
    const query = { sort: 'name', page: { number: 0, size: 0 } };

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(paginated))
      .mockResolvedValueOnce(createResponse(tag));

    await expect(websiteTagService.list(query)).resolves.toEqual(paginated);
    await expect(websiteTagService.get(5)).resolves.toEqual(tag);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'website-tags', { params: query });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'website-tags/5');
  });

  it('creates and updates website tags', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(createResponse({ id: 6, name: 'ui' }));
    vi.mocked(apiClient.patch).mockResolvedValue(createResponse({ id: 6, name: 'design' }));

    await expect(websiteTagService.create({ name: 'ui' })).resolves.toEqual({ id: 6, name: 'ui' });
    await expect(websiteTagService.update(6, { name: 'design' })).resolves.toEqual({ id: 6, name: 'design' });

    expect(apiClient.post).toHaveBeenCalledWith('website-tags', { name: 'ui' });
    expect(apiClient.patch).toHaveBeenCalledWith('website-tags/6', { name: 'design' });
  });

  it('deletes website tags', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(websiteTagService.remove(6)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('website-tags/6');
  });
});
