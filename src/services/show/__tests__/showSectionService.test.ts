import type { ShowSection } from '@/interfaces/api/models/ShowSection';
import type { CreateShowSectionRequest } from '@/interfaces/api/requests/CreateShowSectionRequest';
import type { UpdateShowSectionRequest } from '@/interfaces/api/requests/UpdateShowSectionRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { showSectionService } from '../showSectionService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const section: ShowSection = {
  id: 5,
  category_id: 2,
  description: 'World-hopping stories.',
  sort_order: 1,
  category: { id: 2, name: 'Isekai', value: 'isekai', icon: 'mdi-earth' },
};

describe('showSectionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists and gets show sections', async () => {
    const page: PaginatedResponse<ShowSection> = {
      data: [section],
      meta: { current_page: 1, last_page: 1, per_page: 0, total: 1 },
    };
    const query = { sort: 'sort_order', page: { number: 0, size: 0 } };

    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(page)).mockResolvedValueOnce(createResponse(section));

    await expect(showSectionService.list(query)).resolves.toEqual(page);
    await expect(showSectionService.get(5)).resolves.toEqual(section);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'show-sections', { params: query });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'show-sections/5');
  });

  it('creates and updates show sections', async () => {
    const createRequest: CreateShowSectionRequest = {
      category_id: 2,
      description: null,
      sort_order: 1,
    };
    const updateRequest: UpdateShowSectionRequest = {
      sort_order: 3,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(section));
    vi.mocked(apiClient.patch).mockResolvedValue(createResponse({ ...section, sort_order: 3 }));

    await expect(showSectionService.create(createRequest)).resolves.toEqual(section);
    await expect(showSectionService.update(5, updateRequest)).resolves.toEqual({ ...section, sort_order: 3 });

    expect(apiClient.post).toHaveBeenCalledWith('show-sections', createRequest);
    expect(apiClient.patch).toHaveBeenCalledWith('show-sections/5', updateRequest);
  });

  it('removes show sections', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(showSectionService.remove(5)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('show-sections/5');
  });
});
