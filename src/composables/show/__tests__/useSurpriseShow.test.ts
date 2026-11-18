import type { Show } from '@/interfaces/api/models/Show';
import type * as VueQuery from '@tanstack/vue-query';
import type { EffectScope } from 'vue';
import { QueryClient } from '@tanstack/vue-query';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';
import { WATCHED_SHOW_STATUSES } from '@/utils/show/watch-status/watchedShowStatuses';
import { useSurpriseShow } from '../useSurpriseShow';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const showAPIErrorSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showWarningSnackbar }),
}));

vi.mock('@/services/show/showService', () => ({
  showService: {
    list: vi.fn(),
  },
}));

/**
 * Builds a list response holding shows with the given ids.
 * @param ids - The show ids, in pick order.
 * @returns The paginated list response.
 */
const createResponse = (ids: number[]) => ({
  data: ids.map((id) => ({ id }) as Show),
  meta: { current_page: 1, last_page: 1, per_page: 2, total: ids.length },
});

const scopes: EffectScope[] = [];

/**
 * Runs the composable with its own drawer state.
 * @returns The composable's result and the drawer refs.
 */
const setup = () => {
  const showId = ref<number | null>(null);
  const isShown = ref<boolean>(false);

  const scope = effectScope();
  scopes.push(scope);

  const surprise = scope.run(() => useSurpriseShow({ showId, isShown }))!;

  return { ...surprise, showId, isShown };
};

describe('useSurpriseShow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('asks for random unwatched shows and opens the first one', async () => {
    vi.mocked(showService.list).mockResolvedValue(createResponse([4, 7]));
    const { pickShow, showId, isShown, isSurprisePick, isPicking } = setup();

    await pickShow();

    expect(showService.list).toHaveBeenCalledWith({
      filter: { exclude_watch_status: WATCHED_SHOW_STATUSES },
      sort: 'random',
      page: { size: 2 },
    });
    expect(showId.value).toBe(4);
    expect(isShown.value).toBe(true);
    expect(isSurprisePick.value).toBe(true);
    expect(isPicking.value).toBe(false);
  });

  it('keeps the picks in the query cache, so the drawer opens on them at once', async () => {
    const response = createResponse([4, 7]);
    vi.mocked(showService.list).mockResolvedValue(response);
    const { pickShow } = setup();

    await pickShow();

    expect(queryClient.getQueryData([ShowQueryKey.SurpriseShows])).toEqual(response);
  });

  it('rolls again on every press', async () => {
    vi.mocked(showService.list).mockResolvedValue(createResponse([4]));
    const { pickShow } = setup();

    await pickShow();
    await pickShow();

    expect(showService.list).toHaveBeenCalledTimes(2);
  });

  it('skips the show already open when there is another', async () => {
    vi.mocked(showService.list).mockResolvedValue(createResponse([4, 7]));
    const { pickShow, showId } = setup();
    showId.value = 4;

    await pickShow();

    expect(showId.value).toBe(7);
  });

  it('opens the only match again when it is already open', async () => {
    vi.mocked(showService.list).mockResolvedValue(createResponse([4]));
    const { pickShow, showId, isShown } = setup();
    showId.value = 4;

    await pickShow();

    expect(showId.value).toBe(4);
    expect(isShown.value).toBe(true);
  });

  it('warns and leaves the drawer closed when nothing matches', async () => {
    vi.mocked(showService.list).mockResolvedValue(createResponse([]));
    const { pickShow, isShown, isSurprisePick } = setup();

    await pickShow();

    expect(showWarningSnackbar).toHaveBeenCalledOnce();
    expect(isShown.value).toBe(false);
    expect(isSurprisePick.value).toBe(false);
  });

  it('shows a failed request in a snackbar', async () => {
    const error = new AxiosError('Network Error');
    vi.mocked(showService.list).mockRejectedValue(error);
    const { pickShow, isShown, isPicking } = setup();

    await pickShow();

    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(isShown.value).toBe(false);
    expect(isPicking.value).toBe(false);
  });

  it('ignores a second pick while one is loading', async () => {
    vi.mocked(showService.list).mockResolvedValue(createResponse([4]));
    const { pickShow } = setup();

    await Promise.all([pickShow(), pickShow()]);

    expect(showService.list).toHaveBeenCalledOnce();
  });

  it('ends the surprise pick when the drawer closes', async () => {
    vi.mocked(showService.list).mockResolvedValue(createResponse([4]));
    const { pickShow, isShown, isSurprisePick } = setup();

    await pickShow();
    isShown.value = false;
    await nextTick();

    expect(isSurprisePick.value).toBe(false);
  });
});
