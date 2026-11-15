import type { VideoFileRunStatus } from '@/utils/show/video-file/getVideoFileRunOutcome';
import type * as VueQuery from '@tanstack/vue-query';
import type { EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { useVideoFileRun as useVideoFileRunUnscoped } from '../useVideoFileRun';

interface QueryOptions {
  refetchInterval: (query: { state: { data?: VideoFileRunStatus; status: string } }) => number | false;
}

let queryOptions: QueryOptions;

const status = ref<VideoFileRunStatus | undefined>(undefined);
const isError = ref<boolean>(false);
const onEnd = vi.fn();

// Writing the cache updates the query's data, like TanStack does for its observers.
const setQueryData = vi.fn((_key: unknown, data: VideoFileRunStatus) => {
  status.value = data;
});

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => ({ setQueryData }),
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
const useVideoFileRun = (): ReturnType<typeof useVideoFileRunUnscoped<VideoFileRunStatus>> => {
  const scope = effectScope();

  scopes.push(scope);

  return scope.run(() =>
    useVideoFileRunUnscoped<VideoFileRunStatus>({
      queryKey: ['run'],
      queryFn: vi.fn(),
      pollIntervalMs: 1000,
      onEnd,
    }),
  )!;
};

const finishedAt = '2026-11-15T10:00:00Z';

const createStatus = (overrides: Partial<VideoFileRunStatus> = {}): VideoFileRunStatus => ({
  running: false,
  finished_at: null,
  error: null,
  ...overrides,
});

describe('useVideoFileRun', () => {
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
    useVideoFileRun();

    status.value = createStatus({ running: true });
    await nextTick();
    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(onEnd).toHaveBeenCalledExactlyOnceWith(status.value, 'finished');
  });

  it('reports the end of a run a cached status showed going', async () => {
    status.value = createStatus({ running: true });
    useVideoFileRun();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(onEnd).toHaveBeenCalledWith(status.value, 'finished');
  });

  it('does not report an old end on the first read', async () => {
    useVideoFileRun();

    status.value = createStatus({ finished_at: finishedAt });
    await nextTick();

    expect(onEnd).not.toHaveBeenCalled();
  });

  it('reports a started run that ended at once, even before the first read', async () => {
    const { followStatus } = useVideoFileRun();
    const started = createStatus({ finished_at: finishedAt });

    followStatus(started);
    await nextTick();

    expect(setQueryData).toHaveBeenCalledWith(['run'], started);
    expect(onEnd).toHaveBeenCalledExactlyOnceWith(started, 'finished');
  });

  it('stops trusting a running status after a failed read', () => {
    status.value = createStatus({ running: true });
    isError.value = true;

    expect(useVideoFileRun().isRunning.value).toBe(false);
  });

  it('polls only during a run whose status still reads', () => {
    useVideoFileRun();

    const running = createStatus({ running: true });

    expect(queryOptions.refetchInterval({ state: { data: running, status: 'success' } })).toBe(1000);
    expect(queryOptions.refetchInterval({ state: { data: createStatus(), status: 'success' } })).toBe(false);
    expect(queryOptions.refetchInterval({ state: { data: running, status: 'error' } })).toBe(false);
  });
});
