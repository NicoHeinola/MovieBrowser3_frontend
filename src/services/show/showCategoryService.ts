import type { Category } from '@/interfaces/api/models/Category';

import { apiClient } from '@/plugins/api/apiClient';

const create = async (showId: number, categoryId: number): Promise<Category> => {
  const response = await apiClient.post<Category>(`shows/${showId}/categories`, { category_id: categoryId });

  return response.data;
};

const remove = async (categoryId: number): Promise<void> => {
  await apiClient.delete(`categories/${categoryId}`);
};

export const showCategoryService = {
  create,
  remove,
};
