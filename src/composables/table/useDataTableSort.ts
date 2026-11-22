import type { Ref } from 'vue';
import type { DataTableSortItem } from 'vuetify';

import { computed } from 'vue';

/**
 * Binds a server-sorted data table's headers to a backend sort string, so the table and the backend speak their own
 * terms: clicking "Size" sets `-size`, and setting `-size` from a sort menu marks the "Size" column as sorted.
 * @param sort - The backend sort, such as `-size`; a leading `-` sorts descending.
 * @param sortFields - The backend sort field of each sortable column key, such as `{ size_bytes: 'size' }`.
 * @returns `sortBy`, for the table's `v-model:sort-by`. A sort without a column, such as a relevance order, shows no
 * column as sorted.
 */
export const useDataTableSort = (sort: Ref<string>, sortFields: Record<string, string>) => {
  const sortBy = computed<DataTableSortItem[]>({
    get: () => {
      const field = sort.value.replace(/^-/, '');
      const key = Object.keys(sortFields).find((column) => sortFields[column] === field);
      const order: DataTableSortItem['order'] = sort.value.startsWith('-') ? 'desc' : 'asc';

      return key ? [{ key, order }] : [];
    },
    set: (items: DataTableSortItem[]) => {
      const [item] = items;

      // An unsorted table (a third header click without `must-sort`) keeps the last backend sort
      if (item && sortFields[item.key]) {
        sort.value = `${item.order === 'desc' ? '-' : ''}${sortFields[item.key]}`;
      }
    },
  });

  return { sortBy };
};
