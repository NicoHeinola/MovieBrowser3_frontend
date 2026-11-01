import type { Website } from '@/interfaces/api/models/Website';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import type * as VueQuery from '@tanstack/vue-query';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { websiteService } from '@/services/website/websiteService';
import { useWebsiteFavoriteToggle } from '../useWebsiteFavoriteToggle';

const queryClient = new QueryClient();
const showAPIErrorSnackbar = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar }),
}));

vi.mock('@/services/website/websiteService', () => ({
  websiteService: {
    update: vi.fn(),
  },
}));

const createWebsite = (overrides: Partial<Website> = {}): Website => ({
  id: 3,
  url: 'https://vuetifyjs.com',
  title: 'Vuetify',
  icon: null,
  description: null,
  is_favorite: false,
  tags: [],
  created_at: '2026-10-31T12:00:00.000000Z',
  updated_at: '2026-10-31T12:00:00.000000Z',
  ...overrides,
});

const createPage = (websites: Website[]): PaginatedResponse<Website> => ({
  data: websites,
  meta: { current_page: 1, last_page: 1, per_page: 24, total: websites.length },
});

const pageKey = [WebsiteQueryKey.AdminWebsites, '', 'title', 1];

describe('useWebsiteFavoriteToggle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('saves the flipped flag, swaps the saved website into the list and marks the dashboard stale', async () => {
    const website = createWebsite();
    const other = createWebsite({ id: 4, url: 'https://vuejs.org' });
    const savedWebsite = createWebsite({ is_favorite: true, updated_at: '2026-11-01T12:00:00.000000Z' });
    queryClient.setQueryData(pageKey, createPage([website, other]));
    queryClient.setQueryData([WebsiteQueryKey.AdminDashboardWebsites], createPage([]));
    vi.mocked(websiteService.update).mockResolvedValueOnce(savedWebsite);

    const { savingFavoriteIds, toggleFavorite } = useWebsiteFavoriteToggle();
    const saving = toggleFavorite(website);

    expect(savingFavoriteIds.value).toEqual([3]);
    await saving;

    expect(websiteService.update).toHaveBeenCalledWith(3, { is_favorite: true });
    expect(queryClient.getQueryData<PaginatedResponse<Website>>(pageKey)?.data).toEqual([savedWebsite, other]);
    expect(queryClient.getQueryState([WebsiteQueryKey.AdminDashboardWebsites])?.isInvalidated).toBe(true);
    expect(savingFavoriteIds.value).toEqual([]);
  });

  it('keeps the list and reports the error when the save fails', async () => {
    const website = createWebsite({ is_favorite: true });
    const error = new Error('Network Error');
    queryClient.setQueryData(pageKey, createPage([website]));
    vi.mocked(websiteService.update).mockRejectedValueOnce(error);

    const { savingFavoriteIds, toggleFavorite } = useWebsiteFavoriteToggle();
    await toggleFavorite(website);

    expect(websiteService.update).toHaveBeenCalledWith(3, { is_favorite: false });
    expect(queryClient.getQueryData<PaginatedResponse<Website>>(pageKey)?.data).toEqual([website]);
    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(savingFavoriteIds.value).toEqual([]);
  });
});
