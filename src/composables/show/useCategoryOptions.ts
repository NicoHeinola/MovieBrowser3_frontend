import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { computed } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { categoryService } from '@/services/show/categoryService';

/**
 * Provides a chip for every category.
 * @returns The options and their loading state.
 */
export const useCategoryOptions = () => {
  const categoriesQuery = useAPIQuery<PaginatedResponse<Category>>({
    queryKey: [CategoryQueryKey.ShowFilterCategories],
    queryFn: async () => {
      return await categoryService.list({
        sort: 'name',
        page: { number: 0, size: 0 },
      });
    },
    placeholderData: (previousData) => previousData,
  });

  return {
    options: computed(() =>
      (categoriesQuery.data.value?.data ?? []).map((category) => ({
        value: category.value,
        text: category.name,
        icon: category.icon,
      })),
    ),
    isPending: categoriesQuery.isPending,
  };
};
