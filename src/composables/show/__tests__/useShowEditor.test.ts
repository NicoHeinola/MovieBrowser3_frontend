import type { Show } from '@/interfaces/api/models/Show';
import type { EffectScope, Ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope, ref } from 'vue';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { showEntryService } from '@/services/show/showEntryService';
import { showEpisodeService } from '@/services/show/showEpisodeService';
import { showService } from '@/services/show/showService';
import { showTitleService } from '@/services/show/showTitleService';
import { useShowEditor } from '../useShowEditor';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const confirm = vi.fn();
const showAPIErrorSnackbar = vi.fn();

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('@/composables/dialog/useConfirmDialog', () => ({ useConfirmDialog: () => ({ confirm }) }));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showSuccessSnackbar: vi.fn() }),
}));

vi.mock('@/services/show/showService', () => ({
  showService: { get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showTitleService', () => ({
  showTitleService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showEntryService', () => ({
  showEntryService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showEpisodeService', () => ({
  showEpisodeService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showCategoryService', () => ({
  showCategoryService: { create: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showLinkService', () => ({
  showLinkService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const scopes: EffectScope[] = [];

/**
 * Builds a saved show with one title and one season of two episodes.
 * @param description - The show's description.
 * @returns The show.
 */
const createShow = (description = 'Ninjas'): Show =>
  ({
    id: 4,
    banner_url: 'https://example.com/banner.jpg',
    card_image_url: 'https://example.com/card.jpg',
    preview_url: null,
    description,
    titles: [{ id: 40, show_id: 4, title: 'Naruto', is_primary: true }],
    categories: [],
    entries: [
      {
        id: 41,
        show_id: 4,
        type: ShowEntryType.Season,
        name: 'Season 1',
        sort_order: 0,
        episodes: [
          { id: 42, name: 'One', sequence_number: 0 },
          { id: 43, name: 'Two', sequence_number: 1 },
        ],
      },
    ],
    outgoing_links: [],
    incoming_links: [],
  }) as unknown as Show;

/**
 * Runs the editor inside an app that provides the query client, and waits for the show to load.
 * @param showId - The id of the edited show, or null for a new show.
 * @returns The editor state and the id ref.
 */
const setupEditor = async (showId: number | null) => {
  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });

  const id: Ref<number | null> = ref<number | null>(showId);
  const scope = effectScope();
  scopes.push(scope);

  const editor = app.runWithContext(() => scope.run(() => useShowEditor(id)))!;
  await flushPromises();

  return { ...editor, id };
};

describe('useShowEditor', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    vi.mocked(showService.get).mockResolvedValue(createShow());
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('starts a new show with an empty primary title and one season, and nothing to save yet', async () => {
    const { show, hasChanges, isLoading } = await setupEditor(null);

    expect(showService.get).not.toHaveBeenCalled();
    expect(isLoading.value).toBe(false);
    expect(show.value?.titles).toEqual([{ title: '', is_primary: true }]);
    const season = { name: 'Season 1', type: ShowEntryType.Season, sort_order: 0, episodes: [] };
    expect(show.value?.entries).toEqual([season]);
    expect(hasChanges.value).toBe(false);
  });

  it('loads a copy of the show and tracks changes against it', async () => {
    const { show, hasChanges, discard } = await setupEditor(4);

    expect(show.value?.description).toBe('Ninjas');
    expect(hasChanges.value).toBe(false);

    show.value!.description = 'Pirates';
    expect(hasChanges.value).toBe(true);
    expect(queryClient.getQueryData<Show>([ShowQueryKey.AdminShowEditor, 4])?.description).toBe('Ninjas');

    discard();
    expect(show.value?.description).toBe('Ninjas');
    expect(hasChanges.value).toBe(false);
  });

  it('keeps unsaved edits when the show refetches, and takes the refetch when there are none', async () => {
    const { show } = await setupEditor(4);

    show.value!.description = 'Pirates';
    queryClient.setQueryData([ShowQueryKey.AdminShowEditor, 4], createShow('From another tab'));
    await flushPromises();
    expect(show.value?.description).toBe('Pirates');

    show.value!.description = 'Ninjas';
    queryClient.setQueryData([ShowQueryKey.AdminShowEditor, 4], createShow('From a third tab'));
    await flushPromises();
    expect(show.value?.description).toBe('From a third tab');
  });

  it('keeps the draft when only watch data changes, as it does while the show plays in another tab', async () => {
    const { show } = await setupEditor(4);
    const draft = show.value;

    const watchedShow = createShow();
    watchedShow.watch_progress = { show_entry_episode_id: 43, position_seconds: 120 } as Show['watch_progress'];
    watchedShow.entries![0]!.watch_status = { show_entry_id: 41, status: 'watching' } as never;
    queryClient.setQueryData([ShowQueryKey.AdminShowEditor, 4], watchedShow);
    await flushPromises();

    // The same objects, so open panels and the form keep their state.
    expect(show.value).toBe(draft);
  });

  it('creates a new show and everything in it, then reloads it', async () => {
    vi.mocked(showService.create).mockResolvedValue({ id: 9 } as Show);
    vi.mocked(showTitleService.create).mockResolvedValue({ id: 90 } as never);
    vi.mocked(showEntryService.create).mockResolvedValue({ id: 91 } as never);
    vi.mocked(showService.get).mockResolvedValue({ ...createShow(), id: 9 });
    const { show, save, hasChanges } = await setupEditor(null);

    show.value!.titles[0]!.title = 'Bleach';
    await expect(save()).resolves.toBe(9);

    expect(showService.create).toHaveBeenCalled();
    expect(showTitleService.create).toHaveBeenCalledWith(9, expect.objectContaining({ title: 'Bleach' }));
    expect(showEntryService.create).toHaveBeenCalledWith(9, expect.objectContaining({ name: 'Season 1' }));
    expect(showService.get).toHaveBeenCalledWith(9);
    expect(show.value?.id).toBe(9);
    expect(hasChanges.value).toBe(false);
  });

  it('only sends what changed on an existing show and counts episode progress', async () => {
    const { show, save, episodeProgress } = await setupEditor(4);
    const progress: (number | undefined)[] = [];
    vi.mocked(showEpisodeService.update).mockImplementation(async () => {
      progress.push(episodeProgress.value?.done);
    });

    show.value!.entries![0]!.episodes![1]!.name = 'Two, renamed';
    await save();

    expect(showService.update).not.toHaveBeenCalled();
    expect(showTitleService.update).not.toHaveBeenCalled();
    expect(showEntryService.update).not.toHaveBeenCalled();
    expect(showEpisodeService.update).toHaveBeenCalledWith(43, expect.objectContaining({ name: 'Two, renamed' }));
    expect(progress).toEqual([0]);
    expect(episodeProgress.value).toBeNull();
  });

  it('fetches the show once after a save', async () => {
    const { show, save } = await setupEditor(4);
    vi.mocked(showService.get).mockClear();

    show.value!.description = 'Pirates';
    await save();
    await flushPromises();

    expect(showService.get).toHaveBeenCalledOnce();
  });

  it('fetches a new show once after its save, also when the editor switches to its id', async () => {
    vi.mocked(showService.create).mockResolvedValue({ id: 9 } as Show);
    vi.mocked(showTitleService.create).mockResolvedValue({ id: 90 } as never);
    vi.mocked(showEntryService.create).mockResolvedValue({ id: 91 } as never);
    vi.mocked(showService.get).mockResolvedValue({ ...createShow(), id: 9 });
    const { show, save, id } = await setupEditor(null);

    show.value!.titles[0]!.title = 'Bleach';
    await save();
    // The page moves to the new show's edit URL.
    id.value = 9;
    await flushPromises();

    expect(showService.get).toHaveBeenCalledOnce();
  });

  it('keeps the draft after a failed save, so saving again retries it', async () => {
    vi.mocked(showService.update).mockRejectedValueOnce(new Error('fail'));
    const { show, save, hasChanges } = await setupEditor(4);

    show.value!.description = 'Pirates';
    await expect(save()).resolves.toBeNull();

    expect(showAPIErrorSnackbar).toHaveBeenCalled();
    expect(show.value?.description).toBe('Pirates');
    expect(hasChanges.value).toBe(true);

    vi.mocked(showService.get).mockResolvedValue(createShow('Pirates'));
    await expect(save()).resolves.toBe(4);
    expect(showService.update).toHaveBeenCalledTimes(2);
  });

  it('deletes the show only after the user confirms', async () => {
    const { remove, show, hasChanges } = await setupEditor(4);
    show.value!.description = 'Pirates';

    confirm.mockResolvedValueOnce(false);
    await expect(remove()).resolves.toBe(false);
    expect(showService.remove).not.toHaveBeenCalled();

    confirm.mockResolvedValueOnce(true);
    await expect(remove()).resolves.toBe(true);
    expect(showService.remove).toHaveBeenCalledWith(4);
    // A deleted show has nothing left to save, so leaving the page doesn't ask about it.
    expect(hasChanges.value).toBe(false);
  });
});
