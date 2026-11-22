import { describe, expect, it } from 'vitest';
import { ref } from 'vue';

import { useDataTableSort } from '../useDataTableSort';

const sortFields = { size_bytes: 'size', uploaded_at: 'date' };

describe('useDataTableSort', () => {
  it('marks the column of the backend sort, with its direction', () => {
    const sort = ref('-size');
    const { sortBy } = useDataTableSort(sort, sortFields);

    expect(sortBy.value).toEqual([{ key: 'size_bytes', order: 'desc' }]);

    sort.value = 'date';
    expect(sortBy.value).toEqual([{ key: 'uploaded_at', order: 'asc' }]);
  });

  it('shows no sorted column for a sort without one', () => {
    const { sortBy } = useDataTableSort(ref('best'), sortFields);

    expect(sortBy.value).toEqual([]);
  });

  it('turns a header click into the backend sort', () => {
    const sort = ref('best');
    const { sortBy } = useDataTableSort(sort, sortFields);

    sortBy.value = [{ key: 'uploaded_at', order: 'desc' }];
    expect(sort.value).toBe('-date');

    sortBy.value = [{ key: 'size_bytes', order: 'asc' }];
    expect(sort.value).toBe('size');
  });

  it('keeps the backend sort when the table is unsorted or a column has no backend field', () => {
    const sort = ref('-size');
    const { sortBy } = useDataTableSort(sort, sortFields);

    sortBy.value = [];
    sortBy.value = [{ key: 'title', order: 'asc' }];
    expect(sort.value).toBe('-size');
  });
});
