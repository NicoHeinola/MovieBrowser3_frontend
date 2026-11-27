import type { Download } from '@/interfaces/api/models/Download';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { useDownloadCancel } from '../useDownloadCancel';

const showDialog = vi.fn();
const snackbar = { showSuccessSnackbar: vi.fn() };
let queryClient: QueryClient;

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useQueryClient: () => queryClient,
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/features/download/cancel-download-dialog', () => ({ CancelDownloadDialog: {} }));
vi.mock('@/components/layouts/dialog-provider', () => ({ useDialog: () => ({ showDialog }) }));
vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({ useCommonSnackbar: () => snackbar }));

const download = { id: 7, status: DownloadStatus.Downloading } as Download;

/**
 * Whether a cached query is marked to be read again.
 * @param key - The query's key.
 * @returns True once it is.
 */
const isInvalidated = (key: string): boolean => queryClient.getQueryState([key])!.isInvalidated;

describe('useDownloadCancel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient();
    queryClient.setQueryData([DownloadQueryKey.AdminDownloads], []);
    queryClient.setQueryData([DownloadQueryKey.ShowEditorDownload], {});
    queryClient.setQueryData([ShowQueryKey.AdminShowEditor], {});
  });

  it('says so and refreshes the list of downloads, but not the cancelled download itself', async () => {
    showDialog.mockResolvedValue(true);

    const isCancelled = await useDownloadCancel().cancelDownload(download);

    expect(isCancelled).toBe(true);
    expect(snackbar.showSuccessSnackbar).toHaveBeenCalledWith('download.cancelled');
    expect(isInvalidated(DownloadQueryKey.AdminDownloads)).toBe(true);
    expect(isInvalidated(DownloadQueryKey.ShowEditorDownload)).toBe(false);
    expect(isInvalidated(ShowQueryKey.AdminShowEditor)).toBe(true);
  });

  it('says a completed download was removed', async () => {
    showDialog.mockResolvedValue(true);

    await useDownloadCancel().cancelDownload({ ...download, status: DownloadStatus.Completed });

    expect(snackbar.showSuccessSnackbar).toHaveBeenCalledWith('download.removed');
  });

  it('changes nothing when the user keeps the download', async () => {
    showDialog.mockResolvedValue(false);

    const isCancelled = await useDownloadCancel().cancelDownload(download);

    expect(isCancelled).toBe(false);
    expect(snackbar.showSuccessSnackbar).not.toHaveBeenCalled();
    expect(isInvalidated(DownloadQueryKey.AdminDownloads)).toBe(false);
  });
});
