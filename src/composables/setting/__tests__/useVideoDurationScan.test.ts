import type { VideoDurationScanStatus } from '@/interfaces/api/models/VideoDurationScanStatus';
import type * as VueQuery from '@tanstack/vue-query';
import type { AxiosResponse } from 'axios';
import type { EffectScope } from 'vue';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import en from '@/plugins/i18n/en.json';
import { videoDurationScanService } from '@/services/show/videoDurationScanService';

import { useVideoDurationScan as useVideoDurationScanUnscoped } from '../useVideoDurationScan';

const status = ref<VideoDurationScanStatus | undefined>(undefined);
const isError = ref<boolean>(false);
const refetch = vi.fn();
const invalidateQueries = vi.fn();
// Like the real cache: the mocked query reads what a start request hands over.
const setQueryData = vi.fn((_key: unknown, data: VideoDurationScanStatus) => {
  status.value = data;
});
const showAPIErrorSnackbar = vi.fn();
const showErrorSnackbar = vi.fn();
const showSuccessSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => ({ invalidateQueries, setQueryData }),
}));

// Only useI18n is replaced: the error and date utilities reach the real i18n plugin.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({
    locale: ref('en'),
    // Keeps the count in the text, so tests can see which number reached the message.
    t: (key: string, named?: { count?: number }) => (named?.count === undefined ? key : `${key}:${named.count}`),
    te: () => true,
  }),
}));

vi.mock('@/composables/api/useAPIQuery', () => ({
  useAPIQuery: () => {
    return { data: status, isError, isPending: ref(false), refetch };
  },
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showErrorSnackbar, showSuccessSnackbar, showWarningSnackbar }),
}));

vi.mock('@/services/show/videoDurationScanService', () => ({
  videoDurationScanService: { get: vi.fn(), start: vi.fn() },
}));

/** Every instance's scope, stopped after each test so an old instance's watcher can't react to the shared status. */
const scopes: EffectScope[] = [];

/**
 * Calls the composable inside its own effect scope.
 * @returns The composable's result.
 */
const useVideoDurationScan = (): ReturnType<typeof useVideoDurationScanUnscoped> => {
  const scope = effectScope();

  scopes.push(scope);

  return scope.run(() => useVideoDurationScanUnscoped())!;
};

const finishedAt = '2026-11-21T10:00:00Z';

const createStatus = (overrides: Partial<VideoDurationScanStatus> = {}): VideoDurationScanStatus => ({
  running: false,
  read: 0,
  total: 0,
  finished_at: null,
  error: null,
  unknown_durations_count: 0,
  ...overrides,
});

const createError = (code: ApiErrorCode, httpStatus: number): AxiosError => {
  const response = { status: httpStatus, data: { code, params: {} } } as AxiosResponse;

  return new AxiosError('Request failed', undefined, undefined, undefined, response);
};

describe('useVideoDurationScan', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setQueryData.mockImplementation((_key: unknown, data: VideoDurationScanStatus) => {
      status.value = data;
    });
    status.value = undefined;
    isError.value = false;
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('reports a finished scan and refreshes the shows and stats', async () => {
    status.value = createStatus({ running: true });
    useVideoDurationScan();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.durationScanFinished');
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('warns with the count when files could not be read', async () => {
    status.value = createStatus({ running: true });
    useVideoDurationScan();

    status.value = createStatus({ finished_at: finishedAt, unknown_durations_count: 3 });
    await nextTick();

    expect(showWarningSnackbar).toHaveBeenCalledWith('settings.durationScanFinishedUnknown:3');
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
  });

  it('shows why a scan failed and still refreshes what it read', async () => {
    status.value = createStatus({ running: true });
    useVideoDurationScan();

    status.value = createStatus({
      finished_at: finishedAt,
      error: { code: ApiErrorCode.VideoBasePathUnavailable, params: {} },
    });
    await nextTick();

    expect(showErrorSnackbar).toHaveBeenCalledWith(en.apiErrors.codes.video_base_path_unavailable);
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('starts a scan of some shows and follows the returned status', async () => {
    vi.mocked(videoDurationScanService.start).mockResolvedValue(createStatus({ running: true, total: 12 }));
    const { isRunning, progressText, startScan } = useVideoDurationScan();

    await startScan({ showIds: [4] });

    expect(videoDurationScanService.start).toHaveBeenCalledWith({ show_ids: [4] });
    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.durationScanStarted');
    expect(isRunning.value).toBe(true);
    expect(progressText.value).toBe('settings.episodeProgress');
  });

  it('starts a scan of everything without show ids', async () => {
    vi.mocked(videoDurationScanService.start).mockResolvedValue(createStatus());
    const { startScan } = useVideoDurationScan();

    await startScan();

    expect(videoDurationScanService.start).toHaveBeenCalledWith({});
  });

  it('starts a scan of only the episodes without a length', async () => {
    vi.mocked(videoDurationScanService.start).mockResolvedValue(createStatus({ running: true, total: 3 }));
    const { startScan } = useVideoDurationScan();

    await startScan({ onlyMissing: true });

    expect(videoDurationScanService.start).toHaveBeenCalledWith({ only_missing: true });
  });

  it('says when there was nothing to read instead of saying a scan started', async () => {
    status.value = createStatus({ finished_at: finishedAt });
    vi.mocked(videoDurationScanService.start).mockResolvedValue(createStatus({ finished_at: finishedAt }));
    const { startScan } = useVideoDurationScan();

    await startScan({ showIds: [4] });

    expect(showWarningSnackbar).toHaveBeenCalledWith('settings.durationScanNothingToRead');
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
  });

  it('reports a scan that ended before the start request returned as finished', async () => {
    status.value = createStatus();
    vi.mocked(videoDurationScanService.start).mockResolvedValue(createStatus({ finished_at: finishedAt }));
    const { startScan } = useVideoDurationScan();

    await startScan({ showIds: [4] });
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledExactlyOnceWith('settings.durationScanFinished');
    expect(showWarningSnackbar).not.toHaveBeenCalled();
  });

  it('shows start errors', async () => {
    const error = createError(ApiErrorCode.VideoRelocationRunning, 409);
    vi.mocked(videoDurationScanService.start).mockRejectedValue(error);
    const { isStarting, startScan } = useVideoDurationScan();

    await startScan();

    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
    expect(isStarting.value).toBe(false);
  });

  it('follows a scan it started until it ends', async () => {
    vi.mocked(videoDurationScanService.start).mockResolvedValue(createStatus({ running: true, total: 2 }));
    const { isFollowing, startScan } = useVideoDurationScan();

    await startScan({ showIds: [4] });
    expect(isFollowing.value).toBe(true);

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();
    expect(isFollowing.value).toBe(false);
  });

  it('does not follow a scan another page started', () => {
    status.value = createStatus({ running: true, total: 5 });

    const { isFollowing } = useVideoDurationScan();

    expect(isFollowing.value).toBe(false);
  });

  it('follows a scan a save queued, and stops when it already ended', async () => {
    refetch.mockImplementation(async () => {
      status.value = createStatus({ finished_at: finishedAt });
    });
    const { followQueuedScan, isFollowing } = useVideoDurationScan();

    await followQueuedScan();

    expect(refetch).toHaveBeenCalledOnce();
    expect(isFollowing.value).toBe(false);
  });

  it('shows progress while a scan runs', () => {
    status.value = createStatus({ running: true, read: 10, total: 40 });

    const { statusCard } = useVideoDurationScan();

    expect(statusCard.value).toMatchObject({ title: 'settings.durationScanRunning', progress: 25, running: true });
  });

  it('shows a warning with the count of unreadable files after a scan', () => {
    status.value = createStatus({ finished_at: finishedAt, unknown_durations_count: 2 });

    const { statusCard } = useVideoDurationScan();

    expect(statusCard.value).toMatchObject({ text: 'settings.durationScanUnknown:2', type: 'warning' });
  });

  it('says when no lengths were read yet', () => {
    status.value = createStatus();

    const { progressText, statusCard } = useVideoDurationScan();

    expect(statusCard.value).toMatchObject({ title: 'settings.durationScanNever', type: 'info' });
    expect(progressText.value).toBeNull();
  });
});
