import type { Show } from '@/interfaces/api/models/Show';
import type * as VueQuery from '@tanstack/vue-query';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowEditDialog } from '@/components/features/show/show-edit-dialog';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { useShowEditDialog } from '../useShowEditDialog';

const queryClient = new QueryClient();
const showDialog = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

vi.mock('@/components/layouts/dialog-provider', () => ({
  useDialog: () => ({ showDialog }),
}));

vi.mock('@/components/features/show/show-edit-dialog', () => ({
  ShowEditDialog: { name: 'ShowEditDialog' },
}));

const show = { id: 4, titles: [{ title: 'Naruto', is_primary: true }] } as unknown as Show;

describe('useShowEditDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    for (const queryKey of Object.values(ShowQueryKey)) {
      queryClient.setQueryData([queryKey, 'page', 1], []);
    }
    queryClient.setQueryData([WebsiteQueryKey.AdminWebsites], []);
  });

  /**
   * Lists the cached queries that are marked stale.
   * @returns The first key part of each invalidated query.
   */
  const getInvalidatedKeys = (): unknown[] =>
    queryClient
      .getQueryCache()
      .findAll()
      .filter((query) => query.state.isInvalidated)
      .map((query) => query.queryKey[0]);

  it('opens a copy of the show and refreshes every show cache after a save', async () => {
    showDialog.mockResolvedValueOnce(true);

    const { openShowEditDialog } = useShowEditDialog();

    await expect(openShowEditDialog(show)).resolves.toBe(true);

    const props = showDialog.mock.calls[0]?.[0].props;
    expect(showDialog).toHaveBeenCalledWith({ component: ShowEditDialog, props: { show } });
    expect(props.show).not.toBe(show);
    expect(getInvalidatedKeys()).toEqual(Object.values(ShowQueryKey));
  });

  it('opens a new show with one season and leaves the caches alone when cancelled', async () => {
    showDialog.mockResolvedValueOnce(undefined);

    const { openShowEditDialog } = useShowEditDialog();

    await expect(openShowEditDialog()).resolves.toBe(false);

    expect(showDialog.mock.calls[0]?.[0].props.show).toMatchObject({
      titles: [{ title: '', is_primary: true }],
      entries: [{ name: 'Season 1', type: ShowEntryType.Season, sort_order: 0 }],
    });
    expect(getInvalidatedKeys()).toEqual([]);
  });
});
