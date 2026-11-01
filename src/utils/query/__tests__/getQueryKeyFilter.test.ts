import { QueryClient } from '@tanstack/vue-query';
import { describe, expect, it } from 'vitest';

import { getQueryKeyFilter } from '../getQueryKeyFilter';

enum FruitQueryKey {
  Apples = 'apples',
  Pears = 'pears',
}

enum VegetableQueryKey {
  Carrots = 'carrots',
}

const createClient = (): QueryClient => {
  const queryClient = new QueryClient();
  queryClient.setQueryData([FruitQueryKey.Apples], 1);
  queryClient.setQueryData([FruitQueryKey.Pears, 'page', 2], 2);
  queryClient.setQueryData([VegetableQueryKey.Carrots], 3);
  queryClient.setQueryData(['other'], 4);
  return queryClient;
};

describe('getQueryKeyFilter', () => {
  it('matches every query keyed by a member of the enums, whatever follows the first key part', () => {
    const queryClient = createClient();

    const keys = queryClient
      .getQueryCache()
      .findAll(getQueryKeyFilter(FruitQueryKey))
      .map((query) => query.queryKey);

    expect(keys).toEqual([[FruitQueryKey.Apples], [FruitQueryKey.Pears, 'page', 2]]);
  });

  it('combines several enums', () => {
    const queryClient = createClient();

    const values = queryClient
      .getQueriesData(getQueryKeyFilter(FruitQueryKey, VegetableQueryKey))
      .map(([, data]) => data);

    expect(values).toEqual([1, 2, 3]);
  });

  it('works in invalidateQueries and setQueriesData', async () => {
    const queryClient = createClient();

    queryClient.setQueriesData<number>(getQueryKeyFilter(VegetableQueryKey), (data) => (data ?? 0) * 10);
    await queryClient.invalidateQueries(getQueryKeyFilter(FruitQueryKey));

    expect(queryClient.getQueryData([VegetableQueryKey.Carrots])).toBe(30);
    expect(queryClient.getQueryState([FruitQueryKey.Apples])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(['other'])?.isInvalidated).toBe(false);
  });
});
