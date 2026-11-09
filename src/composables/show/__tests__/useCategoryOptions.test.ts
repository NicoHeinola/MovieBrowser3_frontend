import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { categoryService } from '@/services/show/categoryService';
import { useCategoryOptions } from '../useCategoryOptions';

const data = ref<unknown>(undefined);
const isPending = ref(true);
let queryFn: () => Promise<unknown>;

vi.mock('@/composables/api/useAPIQuery', () => ({
  useAPIQuery: (options: { queryFn: () => Promise<unknown> }) => {
    queryFn = options.queryFn;

    return { data, isPending };
  },
}));

vi.mock('@/services/show/categoryService', () => ({ categoryService: { list: vi.fn() } }));

describe('useCategoryOptions', () => {
  it('loads every category by name and offers one chip each', async () => {
    const options = useCategoryOptions();
    await queryFn();

    expect(categoryService.list).toHaveBeenCalledWith({ sort: 'name', page: { number: 0, size: 0 } });
    expect(options.isPending).toBe(isPending);
    expect(options.options.value).toEqual([]);

    data.value = { data: [{ id: 1, name: 'Action', value: 'action', icon: 'mdi-sword' }] };
    expect(options.options.value).toEqual([{ value: 'action', text: 'Action', icon: 'mdi-sword' }]);
  });
});
