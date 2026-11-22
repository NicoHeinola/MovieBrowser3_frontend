import type { Category } from '@/interfaces/api/models/Category';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { showCategoryService } from '../showCategoryService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

describe('showCategoryService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('adds a category to a show', async () => {
    const category: Category = { id: 3, name: 'Action', value: 'action', icon: 'mdi-sword' };

    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(category));

    await expect(showCategoryService.create(7, 3)).resolves.toEqual(category);

    expect(apiClient.post).toHaveBeenCalledWith('shows/7/categories', { category_id: 3 });
  });

  it('removes a category from a show', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce(createResponse(undefined));

    await showCategoryService.remove(7, 3);

    expect(apiClient.delete).toHaveBeenCalledWith('shows/7/categories/3');
  });
});
