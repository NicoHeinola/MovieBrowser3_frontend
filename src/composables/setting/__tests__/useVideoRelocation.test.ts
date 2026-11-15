import type { VideoRelocationStatus } from '@/interfaces/api/models/VideoRelocationStatus';
import type * as VueQuery from '@tanstack/vue-query';
import type { AxiosResponse } from 'axios';
import type { EffectScope } from 'vue';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import en from '@/plugins/i18n/en.json';
import { videoRelocationService } from '@/services/show/videoRelocationService';

import { useVideoRelocation as useVideoRelocationUnscoped } from '../useVideoRelocation';

const status = ref<VideoRelocationStatus | undefined>(undefined);
const isError = ref<boolean>(false);
const refetch = vi.fn();
const invalidateQueries = vi.fn();
const reloadSettings = vi.fn();
const showAPIErrorSnackbar = vi.fn();
const showErrorSnackbar = vi.fn();
const showSuccessSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

// Writing the cache updates the query's data, like TanStack does for its observers.
const setQueryData = vi.fn((_key: unknown, data: VideoRelocationStatus) => {
  status.value = data;
});

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => ({ invalidateQueries, setQueryData }),
}));

// Only useI18n is replaced: the error and date utilities reach the real i18n plugin.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({
    locale: ref('en'),
    // Keeps the path in the text, so tests can see which folder reached the message.
    t: (key: string, named?: { path?: string }) => (named?.path === undefined ? key : `${key}:${named.path}`),
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

vi.mock('@/stores/setting/useSettingStore', () => ({
  useSettingStore: () => ({ reloadSettings }),
}));

vi.mock('@/services/show/videoRelocationService', () => ({
  videoRelocationService: { get: vi.fn(), start: vi.fn() },
}));

/** Every instance's scope, stopped after each test so an old instance's watcher can't react to the shared status. */
const scopes: EffectScope[] = [];

/**
 * Calls the composable inside its own effect scope.
 * @returns The composable's result.
 */
const useVideoRelocation = (): ReturnType<typeof useVideoRelocationUnscoped> => {
  const scope = effectScope();

  scopes.push(scope);

  return scope.run(() => useVideoRelocationUnscoped())!;
};

const finishedAt = '2026-11-15T10:00:00Z';

const createStatus = (overrides: Partial<VideoRelocationStatus> = {}): VideoRelocationStatus => ({
  running: false,
  reverting: false,
  moved: 0,
  total: 0,
  from_path: '/old',
  to_path: '/new',
  finished_at: null,
  error: null,
  ...overrides,
});

const createError = (code: ApiErrorCode, httpStatus: number): AxiosError => {
  const response = { status: httpStatus, data: { code, params: {} } } as AxiosResponse;

  return new AxiosError('Request failed', undefined, undefined, undefined, response);
};

describe('useVideoRelocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    status.value = undefined;
    isError.value = false;
    reloadSettings.mockResolvedValue(undefined);
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('reports a finished move, then reloads the settings and the shows', async () => {
    status.value = createStatus({ running: true, total: 10 });
    useVideoRelocation();

    status.value = createStatus({ moved: 10, total: 10, finished_at: finishedAt });
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoRelocationFinished:/new');
    expect(reloadSettings).toHaveBeenCalledOnce();
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('reports a failed move with its reason and still reloads', async () => {
    status.value = createStatus({ running: true, reverting: true });
    useVideoRelocation();

    status.value = createStatus({
      finished_at: finishedAt,
      error: { code: ApiErrorCode.VideoRelocationRevertFailed, params: {} },
    });
    await nextTick();

    expect(showErrorSnackbar).toHaveBeenCalledWith(en.apiErrors.codes.video_relocation_revert_failed);
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
    expect(reloadSettings).toHaveBeenCalledOnce();
  });

  it('warns about a move that stopped without finishing', async () => {
    status.value = createStatus({ running: true });
    useVideoRelocation();

    status.value = createStatus();
    await nextTick();

    expect(showWarningSnackbar).toHaveBeenCalledWith('settings.videoRelocationInterrupted');
  });

  it('starts a move and follows it', async () => {
    const started = createStatus({ running: true, total: 340 });
    vi.mocked(videoRelocationService.start).mockResolvedValue(started);
    const { isRunning, startRelocation } = useVideoRelocation();

    await startRelocation('/new');

    expect(videoRelocationService.start).toHaveBeenCalledWith({ video_base_path: '/new' });
    expect(setQueryData).toHaveBeenCalledWith(expect.anything(), started);
    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoRelocationStarted:/new');
    expect(isRunning.value).toBe(true);
  });

  it('reports a move that ended at once only once, even before any status read', async () => {
    vi.mocked(videoRelocationService.start).mockResolvedValue(createStatus({ finished_at: finishedAt }));
    const { startRelocation } = useVideoRelocation();

    await startRelocation('/new');
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledExactlyOnceWith('settings.videoRelocationFinished:/new');
    expect(reloadSettings).toHaveBeenCalledOnce();
  });

  it('reports a move that ended at once only once after an earlier status read', async () => {
    status.value = createStatus();
    vi.mocked(videoRelocationService.start).mockResolvedValue(createStatus({ finished_at: finishedAt }));
    const { startRelocation } = useVideoRelocation();

    await startRelocation('/new');
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledOnce();
    expect(reloadSettings).toHaveBeenCalledOnce();
  });

  it('reads a move another tab started and passes the error on', async () => {
    const error = createError(ApiErrorCode.VideoRelocationRunning, 409);
    vi.mocked(videoRelocationService.start).mockRejectedValue(error);
    const { isStarting, startRelocation } = useVideoRelocation();

    await expect(startRelocation('/new')).rejects.toBe(error);
    expect(refetch).toHaveBeenCalledOnce();
    expect(isStarting.value).toBe(false);
  });

  it('passes a running video file check on without reading the move status', async () => {
    const error = createError(ApiErrorCode.VideoFileCheckRunning, 409);
    vi.mocked(videoRelocationService.start).mockRejectedValue(error);
    const { startRelocation } = useVideoRelocation();

    await expect(startRelocation('/new')).rejects.toBe(error);
    expect(refetch).not.toHaveBeenCalled();
    expect(setQueryData).not.toHaveBeenCalled();
  });

  it('passes a rejected path on without reading the status', async () => {
    const error = createError(ApiErrorCode.PathNotWritable, 422);
    vi.mocked(videoRelocationService.start).mockRejectedValue(error);
    const { startRelocation } = useVideoRelocation();

    await expect(startRelocation('/new')).rejects.toBe(error);
    expect(refetch).not.toHaveBeenCalled();
  });

  it('shows progress toward the new folder', () => {
    status.value = createStatus({ running: true, moved: 34, total: 340 });

    const { statusCard } = useVideoRelocation();

    expect(statusCard.value).toMatchObject({
      title: 'settings.videoRelocationRunning',
      text: 'settings.videoRelocationTarget:/new',
      type: 'info',
      running: true,
      progress: 10,
      progressText: 'settings.episodeProgress',
    });
  });

  it('shows an unknown amount while the files are still being counted', () => {
    status.value = createStatus({ running: true });

    const { statusCard } = useVideoRelocation();

    expect(statusCard.value).toMatchObject({ progress: null, progressText: 'settings.countingEpisodes' });
  });

  it('shows files moving back to the old folder as a warning', () => {
    status.value = createStatus({ running: true, reverting: true, moved: 5, total: 10 });

    const { statusCard } = useVideoRelocation();

    expect(statusCard.value).toMatchObject({
      title: 'settings.videoRelocationReverting',
      text: 'settings.videoRelocationRevertingTarget:/old',
      type: 'warning',
      progress: 50,
    });
  });

  it("keeps the last move's failure on screen", () => {
    status.value = createStatus({
      finished_at: finishedAt,
      error: { code: ApiErrorCode.VideoRelocationFailed, params: {} },
    });

    const { statusCard } = useVideoRelocation();

    expect(statusCard.value).toMatchObject({
      title: 'settings.videoRelocationFailedAt',
      text: en.apiErrors.codes.video_relocation_failed,
      type: 'error',
    });
  });

  it('shows nothing after a successful move, before any move or when the status can not be read', () => {
    status.value = createStatus({ finished_at: finishedAt });
    expect(useVideoRelocation().statusCard.value).toBeNull();

    status.value = createStatus({ from_path: null, to_path: null });
    expect(useVideoRelocation().statusCard.value).toBeNull();

    status.value = createStatus({ running: true });
    isError.value = true;
    expect(useVideoRelocation().statusCard.value).toBeNull();
  });

  it('does not start a second move to the folder the videos already go to', async () => {
    status.value = createStatus({ running: true });
    const { startRelocation } = useVideoRelocation();

    await startRelocation('/new');

    expect(videoRelocationService.start).not.toHaveBeenCalled();
  });

  it('names the file that could not be moved when the backend knows it', async () => {
    status.value = createStatus({ running: true });
    useVideoRelocation();

    status.value = createStatus({
      finished_at: finishedAt,
      error: { code: ApiErrorCode.VideoRelocationFailed, params: { path: '/old/a.mkv' } },
    });
    await nextTick();

    expect(showErrorSnackbar).toHaveBeenCalledWith(
      `${en.apiErrors.codes.video_relocation_failed} settings.videoRelocationFileNotMoved:/old/a.mkv`,
    );
  });
});
