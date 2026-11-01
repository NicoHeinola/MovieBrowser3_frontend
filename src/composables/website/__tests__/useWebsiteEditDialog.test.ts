import type { Website } from '@/interfaces/api/models/Website';
import type * as VueQuery from '@tanstack/vue-query';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WebsiteEditDialog } from '@/components/features/website/website-edit-dialog';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { useWebsiteEditDialog } from '../useWebsiteEditDialog';

const queryClient = new QueryClient();
const showDialog = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

vi.mock('@/components/layouts/dialog-provider', () => ({
  useDialog: () => ({ showDialog }),
}));

vi.mock('@/components/features/website/website-edit-dialog', () => ({
  WebsiteEditDialog: { name: 'WebsiteEditDialog' },
}));

const website: Website = {
  id: 3,
  url: 'https://vuetifyjs.com',
  title: 'Vuetify',
  icon: null,
  description: null,
  is_favorite: true,
  tags: [{ id: 8, name: 'docs' }],
  created_at: '2026-10-31T12:00:00.000000Z',
  updated_at: '2026-10-31T12:00:00.000000Z',
};

describe('useWebsiteEditDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  });

  it('opens a copy of the website and refreshes every website and tag cache after a save', async () => {
    showDialog.mockResolvedValueOnce(true);

    const { openWebsiteEditDialog } = useWebsiteEditDialog();

    await expect(openWebsiteEditDialog(website)).resolves.toBe(true);

    expect(showDialog).toHaveBeenCalledWith({ component: WebsiteEditDialog, props: { website } });
    expect(showDialog.mock.calls[0]?.[0].props.website).not.toBe(website);
    expect(vi.mocked(queryClient.invalidateQueries).mock.calls.map(([filters]) => filters?.queryKey)).toEqual(
      [...Object.values(WebsiteQueryKey), ...Object.values(WebsiteTagQueryKey)].map((queryKey) => [queryKey]),
    );
  });

  it('opens an empty website and leaves the caches alone when cancelled', async () => {
    showDialog.mockResolvedValueOnce(undefined);

    const { openWebsiteEditDialog } = useWebsiteEditDialog();

    await expect(openWebsiteEditDialog()).resolves.toBe(false);

    expect(showDialog.mock.calls[0]?.[0].props.website).toMatchObject({ id: 0, url: '', is_favorite: false, tags: [] });
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});
