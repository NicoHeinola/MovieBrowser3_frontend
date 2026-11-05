import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import type * as VueQuery from '@tanstack/vue-query';
import type { AxiosResponse } from 'axios';
import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { videoFileCheckService } from '@/services/show/videoFileCheckService';

import { useVideoFileCheck } from '../useVideoFileCheck';

interface QueryOptions {
  refetchInterval: (query: { state: { data?: VideoFileCheckStatus; status: string } }) => number | false;
}

let queryOptions: QueryOptions;

const status = ref<VideoFileCheckStatus | undefined>(undefined);
const isError = ref<boolean>(false);
const refetch = vi.fn();
const invalidateQueries = vi.fn();
const showAPIErrorSnackbar = vi.fn();
const showSuccessSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => ({ invalidateQueries }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: ref('en'), t: (key: string) => key, te: () => true }),
}));

vi.mock('@/composables/api/useAPIQuery', () => ({
  useAPIQuery: (options: QueryOptions) => {
    queryOptions = options;

    return { data: status, isError, isPending: ref(false), refetch };
  },
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showSuccessSnackbar, showWarningSnackbar }),
}));

vi.mock('@/services/show/videoFileCheckService', () => ({
  videoFileCheckService: { get: vi.fn(), start: vi.fn() },
}));

const finishedAt = '2026-11-05T10:00:00Z';

const createStatus = (overrides: Partial<VideoFileCheckStatus> = {}): VideoFileCheckStatus => ({
  running: false,
  checked: 0,
  total: 0,
  finished_at: null,
  error: null,
  ...overrides,
});

const createError = (code: ApiErrorCode): AxiosError => {
  const response = { status: 422, data: { code, params: {} } } as AxiosResponse;

  return new AxiosError('Request failed', undefined, undefined, undefined, response);
};

describe('useVideoFileCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    status.value = undefined;
    isError.value = false;
  });

  it('reports a finished run and refreshes the shows', async () => {
    status.value = createStatus({ running: true });
    useVideoFileCheck();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoFileCheckFinished');
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
    expect(invalidateQueries).toHaveBeenCalledOnce();
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

  it('starts a check and reads the status', async () => {
    const { isStarting, startCheck } = useVideoFileCheck();

    await startCheck();

    expect(videoFileCheckService.start).toHaveBeenCalledOnce();
    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoFileCheckStarted');
    expect(refetch).toHaveBeenCalledOnce();
    expect(isStarting.value).toBe(false);
  });

  it('follows a run that is already going, without an error', async () => {
    vi.mocked(videoFileCheckService.start).mockRejectedValue(createError(ApiErrorCode.VideoFileCheckRunning));
    const { startCheck } = useVideoFileCheck();

    await startCheck();

    expect(refetch).toHaveBeenCalledOnce();
    expect(showAPIErrorSnackbar).not.toHaveBeenCalled();
  });

  it('shows other start errors', async () => {
    const error = createError(ApiErrorCode.VideoBasePathUnavailable);
    vi.mocked(videoFileCheckService.start).mockRejectedValue(error);
    const { startCheck } = useVideoFileCheck();

    await startCheck();

    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(refetch).not.toHaveBeenCalled();
  });

  it('shows an error alert when the status can not be read', () => {
    isError.value = true;

    const { statusAlert } = useVideoFileCheck();

    expect(statusAlert.value).toEqual({ text: 'apiErrors.generic', type: 'error' });
  });

  it("shows progress over the last run's error", () => {
    status.value = createStatus({
      running: true,
      total: 900,
      error: { code: ApiErrorCode.VideoFileCheckFailed, params: {} },
    });

    const { statusAlert } = useVideoFileCheck();

    expect(statusAlert.value).toEqual({ text: 'settings.videoFileCheckProgress', type: 'info' });
  });

  it('polls only during a run whose status still reads', () => {
    useVideoFileCheck();

    const running = createStatus({ running: true });

    expect(queryOptions.refetchInterval({ state: { data: running, status: 'success' } })).toBe(3000);
    expect(queryOptions.refetchInterval({ state: { data: createStatus(), status: 'success' } })).toBe(false);
    expect(queryOptions.refetchInterval({ state: { data: running, status: 'error' } })).toBe(false);
  });

  it('stops trusting a running status after a failed read', () => {
    status.value = createStatus({ running: true, checked: 200, total: 900 });
    isError.value = true;

    const { isRunning, statusAlert } = useVideoFileCheck();

    expect(isRunning.value).toBe(false);
    expect(statusAlert.value).toEqual({ text: 'apiErrors.generic', type: 'error' });
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

  it('says when nothing has been checked yet', () => {
    status.value = createStatus();

    const { statusAlert } = useVideoFileCheck();

    expect(statusAlert.value).toEqual({ text: 'settings.videoFileCheckNever', type: 'info' });
  });
});
