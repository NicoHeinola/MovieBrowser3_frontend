import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import type * as VueQuery from '@tanstack/vue-query';
import type { AxiosResponse } from 'axios';
import type { EffectScope } from 'vue';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import en from '@/plugins/i18n/en.json';
import { videoFileCheckService } from '@/services/video-file/videoFileCheckService';

import { useVideoFileCheck as useVideoFileCheckUnscoped } from '../useVideoFileCheck';

const status = ref<VideoFileCheckStatus | undefined>(undefined);
const isError = ref<boolean>(false);
const invalidateQueries = vi.fn();
/** Following a started run puts its status in the cache, which the query then shows. */
const setQueryData = vi.fn((_key: readonly string[], current: VideoFileCheckStatus) => {
  status.value = current;
});
const showAPIErrorSnackbar = vi.fn();
const showErrorSnackbar = vi.fn();
const showSuccessSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => ({ cancelQueries: vi.fn(), invalidateQueries, setQueryData }),
}));

// Only useI18n is replaced: the error and date utilities reach the real i18n plugin.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({
    locale: ref('en'),
    // Keeps the problems in the text, so tests can see which ones reached the message.
    t: (key: string, named?: { problems?: string }) => (named?.problems ? `${key}:${named.problems}` : key),
    te: () => true,
  }),
}));

vi.mock('@/composables/api/useAPIQuery', () => ({
  useAPIQuery: () => {
    return { data: status, isError, isPending: ref(false), refetch: vi.fn() };
  },
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showErrorSnackbar, showSuccessSnackbar, showWarningSnackbar }),
}));

vi.mock('@/services/video-file/videoFileCheckService', () => ({
  videoFileCheckService: { get: vi.fn(), start: vi.fn() },
}));

/** Every instance's scope, stopped after each test so an old instance's watcher can't react to the shared status. */
const scopes: EffectScope[] = [];

/**
 * Calls the composable inside its own effect scope.
 * @returns The composable's result.
 */
const useVideoFileCheck = (): ReturnType<typeof useVideoFileCheckUnscoped> => {
  const scope = effectScope();

  scopes.push(scope);

  return scope.run(() => useVideoFileCheckUnscoped())!;
};

const finishedAt = '2026-11-05T10:00:00Z';

const createStatus = (overrides: Partial<VideoFileCheckStatus> = {}): VideoFileCheckStatus => ({
  running: false,
  checked: 0,
  total: 0,
  finished_at: null,
  error: null,
  missing_video_files_count: 0,
  unknown_video_durations_count: 0,
  ...overrides,
});

const createError = (code: ApiErrorCode, httpStatus: number): AxiosError => {
  const response = { status: httpStatus, data: { code, params: {} } } as AxiosResponse;

  return new AxiosError('Request failed', undefined, undefined, undefined, response);
};

describe('useVideoFileCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    status.value = undefined;
    isError.value = false;
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('reports a finished run and refreshes the shows', async () => {
    status.value = createStatus({ running: true });
    useVideoFileCheck();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoFileCheckFinished');
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('warns with the count when a finished run found missing files', async () => {
    status.value = createStatus({ running: true });
    useVideoFileCheck();

    status.value = createStatus({ finished_at: finishedAt, missing_video_files_count: 2 });
    await nextTick();

    expect(showWarningSnackbar).toHaveBeenCalledWith(
      'settings.videoFileCheckFinishedProblems:2 video files are missing',
    );
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('refreshes the shows after a crashed run, without a success message', async () => {
    status.value = createStatus({ running: true });
    useVideoFileCheck();

    status.value = createStatus({
      finished_at: finishedAt,
      error: { code: ApiErrorCode.VideoFileCheckFailed, params: {} },
    });
    await nextTick();

    expect(showSuccessSnackbar).not.toHaveBeenCalled();
    expect(showErrorSnackbar).toHaveBeenCalledOnce();
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('reports an unreachable video base folder when a started check ends', async () => {
    status.value = createStatus();
    vi.mocked(videoFileCheckService.start).mockResolvedValue(createStatus({ running: true }));
    const { startCheck } = useVideoFileCheck();

    await startCheck();
    await nextTick();
    status.value = createStatus({
      finished_at: finishedAt,
      error: { code: ApiErrorCode.VideoBaseFolderUnavailable, params: {} },
    });
    await nextTick();

    expect(showErrorSnackbar).toHaveBeenCalledWith(en.apiErrors.codes.video_base_folder_unavailable);
    expect(showAPIErrorSnackbar).not.toHaveBeenCalled();
  });

  it('warns about an interrupted run and refreshes the shows', async () => {
    status.value = createStatus({ running: true });
    useVideoFileCheck();

    status.value = createStatus();
    await nextTick();

    expect(showWarningSnackbar).toHaveBeenCalledWith('settings.videoFileCheckInterrupted');
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('does nothing while a run progresses', async () => {
    status.value = createStatus({ running: true, checked: 200, total: 900 });
    useVideoFileCheck();

    status.value = createStatus({ running: true, checked: 400, total: 900 });
    await nextTick();

    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it('starts a check and follows it', async () => {
    vi.mocked(videoFileCheckService.start).mockResolvedValue(createStatus({ running: true }));
    const { isRunning, isStarting, startCheck } = useVideoFileCheck();

    await startCheck();

    expect(videoFileCheckService.start).toHaveBeenCalledOnce();
    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoFileCheckStarted');
    expect(isRunning.value).toBe(true);
    expect(isStarting.value).toBe(false);
  });

  it('shows other start errors', async () => {
    const error = createError(ApiErrorCode.VideoBaseFolderMoveRunning, 409);
    vi.mocked(videoFileCheckService.start).mockRejectedValue(error);
    const { startCheck } = useVideoFileCheck();

    await startCheck();

    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(setQueryData).not.toHaveBeenCalled();
  });

  it('shows an error alert when the status can not be read', () => {
    isError.value = true;

    const { statusCard } = useVideoFileCheck();

    expect(statusCard.value).toMatchObject({ title: 'apiErrors.generic', type: 'error' });
  });

  it("shows progress over the last run's error", () => {
    status.value = createStatus({
      running: true,
      total: 900,
      error: { code: ApiErrorCode.VideoFileCheckFailed, params: {} },
    });

    const { statusCard } = useVideoFileCheck();

    expect(statusCard.value).toMatchObject({ title: 'settings.videoFileCheckRunning', type: 'info', running: true });
  });

  it('stops trusting a running status after a failed read', () => {
    status.value = createStatus({ running: true, checked: 200, total: 900 });
    isError.value = true;

    const { isRunning, statusCard } = useVideoFileCheck();

    expect(isRunning.value).toBe(false);
    expect(statusCard.value).toMatchObject({ title: 'apiErrors.generic', type: 'error' });
  });

  it('reports the end of a run once the status reads again', async () => {
    status.value = createStatus({ running: true });
    isError.value = true;
    useVideoFileCheck();

    isError.value = false;
    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoFileCheckFinished');
  });

  it('shows a success alert when a finished run found no missing files', () => {
    status.value = createStatus({ finished_at: finishedAt });

    const { statusCard } = useVideoFileCheck();

    expect(statusCard.value).toMatchObject({
      title: 'settings.videoFileCheckFinishedAt',
      text: 'settings.videoFileCheckAllFound',
      type: 'success',
    });
  });

  it('shows a warning alert with the count when files are missing', () => {
    status.value = createStatus({ finished_at: finishedAt, missing_video_files_count: 2 });

    const { statusCard } = useVideoFileCheck();

    expect(statusCard.value).toMatchObject({ text: '2 video files are missing', type: 'warning' });
  });

  it("shows the last run's error over missing files", () => {
    status.value = createStatus({
      finished_at: finishedAt,
      error: { code: ApiErrorCode.VideoFileCheckFailed, params: {} },
      missing_video_files_count: 2,
    });

    const { statusCard } = useVideoFileCheck();

    expect(statusCard.value.type).toBe('error');
  });

  it('shows progress over missing files', () => {
    status.value = createStatus({ running: true, total: 900, finished_at: finishedAt, missing_video_files_count: 2 });

    const { statusCard } = useVideoFileCheck();

    expect(statusCard.value).toMatchObject({ title: 'settings.videoFileCheckRunning', type: 'info', running: true });
  });

  it('shows the progress of a run, or an unknown amount while it counts', () => {
    status.value = createStatus({ running: true, checked: 225, total: 900 });
    expect(useVideoFileCheck().statusCard.value).toMatchObject({
      progress: 25,
      progressText: '225 of 900 episodes',
    });

    status.value = createStatus({ running: true });
    expect(useVideoFileCheck().statusCard.value).toMatchObject({
      progress: null,
      progressText: 'Counting episodes...',
    });
  });

  it('says when nothing has been checked yet', () => {
    status.value = createStatus();

    const { statusCard } = useVideoFileCheck();

    expect(statusCard.value).toMatchObject({ title: 'settings.videoFileCheckNever', type: 'info' });
  });
});
