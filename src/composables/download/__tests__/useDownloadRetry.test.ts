import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { downloadService } from '@/services/download/downloadService';
import { useDownloadRetry } from '../useDownloadRetry';

const snackbar = { showAPIErrorSnackbar: vi.fn(), showSuccessSnackbar: vi.fn() };
let queryClient: QueryClient;

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useQueryClient: () => queryClient,
}));
vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({ useCommonSnackbar: () => snackbar }));
vi.mock('@/services/download/downloadService', () => ({ downloadService: { retry: vi.fn() } }));

/**
 * Whether a cached query is marked to be read again.
 * @param key - The query's key.
 * @returns True once it is.
 */
const isInvalidated = (key: string): boolean => queryClient.getQueryState([key])!.isInvalidated;

describe('useDownloadRetry', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient();
    queryClient.setQueryData([DownloadQueryKey.ShowEditorDownload], {});
    queryClient.setQueryData([ShowQueryKey.AdminShowEditor], {});
  });

  it('says so and refreshes the downloads, and only those', async () => {
    await useDownloadRetry().retryDownload(7, 'started');

    expect(downloadService.retry).toHaveBeenCalledWith(7);
    expect(snackbar.showSuccessSnackbar).toHaveBeenCalledWith('started');
    expect(isInvalidated(DownloadQueryKey.ShowEditorDownload)).toBe(true);
    expect(isInvalidated(ShowQueryKey.AdminShowEditor)).toBe(false);
  });

  it('shows a failure and refreshes nothing', async () => {
    const failure = new Error('closed');
    vi.mocked(downloadService.retry).mockRejectedValue(failure);

    await useDownloadRetry().retryDownload(7, 'started');

    expect(snackbar.showAPIErrorSnackbar).toHaveBeenCalledWith(failure);
    expect(snackbar.showSuccessSnackbar).not.toHaveBeenCalled();
    expect(isInvalidated(DownloadQueryKey.ShowEditorDownload)).toBe(false);
  });
});
