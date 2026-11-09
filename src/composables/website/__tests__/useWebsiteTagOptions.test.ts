import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { websiteTagService } from '@/services/website/websiteTagService';
import { useWebsiteTagOptions } from '../useWebsiteTagOptions';

const data = ref<unknown>(undefined);
const isPending = ref(true);
let queryFn: () => Promise<unknown>;

vi.mock('@/composables/api/useAPIQuery', () => ({
  useAPIQuery: (options: { queryFn: () => Promise<unknown> }) => {
    queryFn = options.queryFn;

    return { data, isPending };
  },
}));

vi.mock('@/services/website/websiteTagService', () => ({ websiteTagService: { list: vi.fn() } }));

describe('useWebsiteTagOptions', () => {
  it('loads every tag by name and shows its website count when the backend sends one', async () => {
    const options = useWebsiteTagOptions();
    await queryFn();

    expect(websiteTagService.list).toHaveBeenCalledWith({ sort: 'name', page: { number: 0, size: 0 } });
    expect(options.isPending).toBe(isPending);

    data.value = {
      data: [
        { id: 1, name: 'News', websites_count: 3 },
        { id: 2, name: 'Blogs' },
      ],
    };
    expect(options.options.value).toEqual([
      { value: '1', text: 'News (3)' },
      { value: '2', text: 'Blogs' },
    ]);
  });
});
