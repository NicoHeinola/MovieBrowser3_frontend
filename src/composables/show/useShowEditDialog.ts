import type { Show } from '@/interfaces/api/models/Show';

import { useQueryClient } from '@tanstack/vue-query';

import { ShowEditDialog } from '@/components/features/show/show-edit-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { deepClone } from '@/utils/clone/deepClone';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';

/**
 * Opens the show edit dialog and refreshes every show cache once it saves or deletes.
 * @returns `openShowEditDialog`.
 */
export const useShowEditDialog = () => {
  const dialog = useDialog();
  const queryClient = useQueryClient();

  /**
   * Opens the dialog on a copy of a show, or on a new show with one season.
   * @param show - The show to edit; leave it out to add a show.
   * @returns Whether the show was saved or deleted.
   */
  const openShowEditDialog = async (show?: Show | null): Promise<boolean> => {
    const refresh = await dialog.showDialog<boolean, Record<string, unknown>>({
      component: ShowEditDialog,
      props: {
        show: show
          ? deepClone(show)
          : {
              titles: [{ title: '', is_primary: true }],
              categories: [],
              entries: [
                {
                  name: 'Season 1',
                  type: ShowEntryType.Season,
                  sort_order: 0,
                },
              ],
              outgoing_links: [],
              incoming_links: [],
            },
      },
    });

    if (refresh) {
      // Shows appear on Home, Search, the dashboard and in autocompletes too, so refresh every show cache.
      await queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey));
    }

    return refresh ?? false;
  };

  return {
    openShowEditDialog,
  };
};
