import type { BackgroundRunStatus } from '@/interfaces/api/models/BackgroundRunStatus';
import type * as VueQuery from '@tanstack/vue-query';
import type { EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

import { useBackgroundRun as useBackgroundRunUnscoped } from '../useBackgroundRun';

interface QueryOptions {
  refetchInterval: (query: { state: { data?: BackgroundRunStatus; status: string } }) => number | false;
}

let queryOptions: QueryOptions;

const status = ref<BackgroundRunStatus | undefined>(undefined);
const isError = ref<boolean>(false);
const reportFinished = vi.fn();
const getErrorMessage = vi.fn(() => 'failure message');
const refreshChangedData = vi.fn(async () => undefined);
const showAPIErrorSnackbar = vi.fn();
const showErrorSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

// Writing the cache updates the query's data, like TanStack does for its observers.
const cancelQueries = vi.fn(async () => undefined);
const setQueryData = vi.fn((_key: unknown, data: BackgroundRunStatus) => {
  status.value = data;
});

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => ({ cancelQueries, setQueryData }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showErrorSnackbar, showWarningSnackbar }),
}));

vi.mock('@/composables/api/useAPIQuery', () => ({
  useAPIQuery: (options: QueryOptions) => {
    queryOptions = options;

    return { data: status, isError, isPending: ref(false), refetch: vi.fn() };
  },
}));

/** Every instance's scope, stopped after each test so an old instance's watcher can't react to the shared status. */
const scopes: EffectScope[] = [];

/**
 * Calls the composable inside its own effect scope, polling every second.
 * @returns The composable's result.
 */
const useBackgroundRun = (): ReturnType<typeof useBackgroundRunUnscoped<BackgroundRunStatus>> => {
  const scope = effectScope();

  scopes.push(scope);

  return scope.run(() =>
    useBackgroundRunUnscoped<BackgroundRunStatus>({
      queryKey: ['run'],
      queryFn: vi.fn(),
      pollIntervalMs: 1000,
      reportFinished,
      getErrorMessage,
      interruptedMessageKey: 'run.interrupted',
      refreshChangedData,
    }),
  )!;
};

const finishedAt = '2026-11-15T10:00:00Z';

const createStatus = (overrides: Partial<BackgroundRunStatus> = {}): BackgroundRunStatus => ({
  running: false,
  finished_at: null,
  error: null,
  ...overrides,
});

describe('useBackgroundRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    status.value = undefined;
    isError.value = false;
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('reports a run that ends while followed', async () => {
    useBackgroundRun();

    status.value = createStatus({ running: true });
    await nextTick();
    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(reportFinished).toHaveBeenCalledExactlyOnceWith(status.value);
    expect(refreshChangedData).toHaveBeenCalledOnce();
  });

  it('reports a failed run with its message and refreshes its data', async () => {
    useBackgroundRun();
    const error = { code: ApiErrorCode.VideoBaseFolderUnavailable, params: {} };

    status.value = createStatus({ running: true });
    await nextTick();
    status.value = createStatus({ finished_at: finishedAt, error });
    await nextTick();

    expect(getErrorMessage).toHaveBeenCalledWith(error);
    expect(showErrorSnackbar).toHaveBeenCalledExactlyOnceWith('failure message');
    expect(reportFinished).not.toHaveBeenCalled();
    expect(refreshChangedData).toHaveBeenCalledOnce();
  });

  it('warns about a run whose worker stopped without a report', async () => {
    useBackgroundRun();

    status.value = createStatus({ running: true });
    await nextTick();
    status.value = createStatus();
    await nextTick();

    expect(showWarningSnackbar).toHaveBeenCalledExactlyOnceWith('run.interrupted');
    expect(refreshChangedData).toHaveBeenCalledOnce();
  });

  it('shows a failed refresh as an API error', async () => {
    const refreshError = new Error('refresh failed');

    refreshChangedData.mockRejectedValueOnce(refreshError);
    useBackgroundRun();

    status.value = createStatus({ running: true });
    await nextTick();
    status.value = createStatus({ finished_at: finishedAt });
    await vi.waitFor(() => expect(showAPIErrorSnackbar).toHaveBeenCalledWith(refreshError));
  });

  it('reports the end of a run a cached status showed going', async () => {
    status.value = createStatus({ running: true });
    useBackgroundRun();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(reportFinished).toHaveBeenCalledWith(status.value);
  });

  it('does not report an old end on the first read', async () => {
    useBackgroundRun();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(reportFinished).not.toHaveBeenCalled();
    expect(refreshChangedData).not.toHaveBeenCalled();
  });

  it('stops a read in flight before it shows a started run, then reports its end', async () => {
    const { followStatus } = useBackgroundRun();
    const started = createStatus({ running: true });

    await followStatus(started);
    await nextTick();

    expect(cancelQueries).toHaveBeenCalledWith({ queryKey: ['run'] });
    expect(cancelQueries.mock.invocationCallOrder[0]).toBeLessThan(setQueryData.mock.invocationCallOrder[0]!);
    expect(status.value).toEqual(started);
    expect(reportFinished).not.toHaveBeenCalled();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(reportFinished).toHaveBeenCalledExactlyOnceWith(status.value);
  });

  it('stops trusting a running status after a failed read', () => {
    status.value = createStatus({ running: true });
    isError.value = true;

    expect(useBackgroundRun().isRunning.value).toBe(false);
  });

  it('polls only during a run whose status still reads', () => {
    useBackgroundRun();

    const running = createStatus({ running: true });

    expect(queryOptions.refetchInterval({ state: { data: running, status: 'success' } })).toBe(1000);
    expect(queryOptions.refetchInterval({ state: { data: createStatus(), status: 'success' } })).toBe(false);
    expect(queryOptions.refetchInterval({ state: { data: running, status: 'error' } })).toBe(false);
  });
});
