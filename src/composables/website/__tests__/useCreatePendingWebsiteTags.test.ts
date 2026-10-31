import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type * as VueQuery from '@tanstack/vue-query';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';
import { useCreatePendingWebsiteTags } from '../useCreatePendingWebsiteTags';

const queryClient = new QueryClient();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

vi.mock('@/services/website/websiteTagService', () => ({
  websiteTagService: {
    create: vi.fn(),
  },
}));

describe('useCreatePendingWebsiteTags', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('creates selected pending tags, swaps in their ids and drops unselected ones', async () => {
    vi.mocked(websiteTagService.create)
      .mockResolvedValueOnce({ id: 20, name: 'music' })
      .mockResolvedValueOnce({ id: 21, name: 'art' });

    const tagIds = ref<number[]>([4, -1, -3]);
    const pendingTags = ref<WebsiteTag[]>([
      { id: -1, name: 'music' },
      { id: -2, name: 'removed' },
      { id: -3, name: 'art' },
    ]);

    await useCreatePendingWebsiteTags().createPendingTags(tagIds, pendingTags);

    expect(websiteTagService.create).toHaveBeenCalledTimes(2);
    expect(websiteTagService.create).toHaveBeenNthCalledWith(1, { name: 'music' });
    expect(websiteTagService.create).toHaveBeenNthCalledWith(2, { name: 'art' });
    expect(tagIds.value).toEqual([4, 20, 21]);
    expect(pendingTags.value).toEqual([]);
  });

  it('reloads every tag list before swapping in the new ids', async () => {
    const tagIds = ref<number[]>([-1]);
    const idsWhenReloaded: number[][] = [];
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockImplementation(async () => {
      idsWhenReloaded.push([...tagIds.value]);
    });
    vi.mocked(websiteTagService.create).mockResolvedValue({ id: 20, name: 'music' });

    await useCreatePendingWebsiteTags().createPendingTags(tagIds, ref([{ id: -1, name: 'music' }]));

    for (const queryKey of Object.values(WebsiteTagQueryKey)) {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [queryKey] });
    }
    expect(idsWhenReloaded.every((ids) => ids.includes(-1))).toBe(true);
    expect(tagIds.value).toEqual([20]);
    invalidateQueries.mockRestore();
  });

  it('does nothing without pending tags', async () => {
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const tagIds = ref<number[]>([4]);
    const pendingTags = ref<WebsiteTag[]>([]);

    await useCreatePendingWebsiteTags().createPendingTags(tagIds, pendingTags);

    expect(websiteTagService.create).not.toHaveBeenCalled();
    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(tagIds.value).toEqual([4]);
    invalidateQueries.mockRestore();
  });

  it('keeps successful creations and rethrows the first failure, so a retry only creates the rest', async () => {
    const error = new Error('The name has already been taken.');
    vi.mocked(websiteTagService.create).mockResolvedValueOnce({ id: 20, name: 'music' }).mockRejectedValueOnce(error);

    const tagIds = ref<number[]>([-1, -2]);
    const pendingTags = ref<WebsiteTag[]>([
      { id: -1, name: 'music' },
      { id: -2, name: 'Docs' },
    ]);
    const { createPendingTags } = useCreatePendingWebsiteTags();

    await expect(createPendingTags(tagIds, pendingTags)).rejects.toBe(error);

    expect(tagIds.value).toEqual([20, -2]);
    expect(pendingTags.value).toEqual([{ id: -2, name: 'Docs' }]);

    vi.mocked(websiteTagService.create).mockResolvedValueOnce({ id: 22, name: 'Docs' });
    await createPendingTags(tagIds, pendingTags);

    expect(websiteTagService.create).toHaveBeenLastCalledWith({ name: 'Docs' });
    expect(tagIds.value).toEqual([20, 22]);
  });
});
