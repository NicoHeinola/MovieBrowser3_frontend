import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { categoryService } from '../categoryService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

/** A category as the backend returns it. */
const category: Category = { id: 3, name: 'Action', value: 'action', icon: 'mdi-sword' };

describe('categoryService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists categories with the query and gets one', async () => {
    const page: PaginatedResponse<Category> = {
      data: [category],
      meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 },
    };

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse(page))
      .mockResolvedValueOnce(createResponse(category));

    await expect(categoryService.list({ sort: 'name', page: { size: 50 } })).resolves.toEqual(page);
    await expect(categoryService.get(3)).resolves.toEqual(category);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'categories', { params: { sort: 'name', page: { size: 50 } } });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'categories/3');
  });

  it('creates, updates and removes a category', async () => {
    const request = { name: 'Action', value: 'action', icon: 'mdi-sword' };

    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(category));
    vi.mocked(apiClient.patch).mockResolvedValueOnce(createResponse(category));
    vi.mocked(apiClient.delete).mockResolvedValueOnce(createResponse(undefined));

    await expect(categoryService.create(request)).resolves.toEqual(category);
    await expect(categoryService.update(3, request)).resolves.toEqual(category);
    await categoryService.remove(3);

    expect(apiClient.post).toHaveBeenCalledWith('categories', request);
    expect(apiClient.patch).toHaveBeenCalledWith('categories/3', request);
    expect(apiClient.delete).toHaveBeenCalledWith('categories/3');
  });
});
