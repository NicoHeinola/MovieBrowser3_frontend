import type { Website } from '@/interfaces/api/models/Website';

import { useQueryClient } from '@tanstack/vue-query';

import { WebsiteEditDialog } from '@/components/features/website/website-edit-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { deepClone } from '@/utils/clone/deepClone';

/**
 * Builds the blank website the dialog starts from when adding one.
 * @returns The empty website.
 */
const getEmptyWebsite = (): Website => ({
  id: 0,
  url: '',
  title: null,
  icon: null,
  description: null,
  is_favorite: false,
  tags: [],
  created_at: '',
  updated_at: '',
});

/**
 * Opens the website edit dialog and refreshes every website and website tag cache once it saves or deletes.
 * @returns `openWebsiteEditDialog`.
 */
export const useWebsiteEditDialog = () => {
  const dialog = useDialog();
  const queryClient = useQueryClient();

  /**
   * Opens the dialog on a copy of a website, or on a new website.
   * @param website - The website to edit; leave it out to add a website.
   * @returns Whether the website was saved or deleted.
   */
  const openWebsiteEditDialog = async (website?: Website): Promise<boolean> => {
    const refresh = await dialog.showDialog<boolean, Record<string, unknown>>({
      component: WebsiteEditDialog,
      props: {
        website: website ? deepClone(website) : getEmptyWebsite(),
      },
    });

    if (refresh) {
      /** Tag names and counts follow the websites. */
      await Promise.all(
        [...Object.values(WebsiteQueryKey), ...Object.values(WebsiteTagQueryKey)].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [queryKey] }),
        ),
      );
    }

    return refresh ?? false;
  };

  return {
    openWebsiteEditDialog,
  };
};
