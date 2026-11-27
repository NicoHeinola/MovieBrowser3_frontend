import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadService } from '@/services/download/downloadService';
import { useDownloadCreate } from '../useDownloadCreate';

const snackbar = { showAPIErrorSnackbar: vi.fn() };
const retryDownload = vi.fn();

vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({ useCommonSnackbar: () => snackbar }));
vi.mock('@/services/download/downloadService', () => ({ downloadService: { create: vi.fn() } }));
vi.mock('../useDownloadRetry', () => ({ useDownloadRetry: () => ({ retryDownload }) }));

/**
 * The backend's answer to a torrent that already is a download.
 * @returns The error.
 */
const createExistsError = (): AxiosError =>
  new AxiosError('exists', undefined, undefined, undefined, {
    status: 409,
    data: { code: 'download_exists', params: { download_id: '7' } },
  } as never);

describe('useDownloadCreate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('adds a new torrent without going over it', async () => {
    vi.mocked(downloadService.create).mockResolvedValue({ id: 3 } as never);

    expect(await useDownloadCreate().createDownload({ magnet_url: 'magnet:' })).toBe(3);
    expect(retryDownload).not.toHaveBeenCalled();
  });

  it('checks a torrent again that was added before', async () => {
    vi.mocked(downloadService.create).mockRejectedValue(createExistsError());

    expect(await useDownloadCreate().createDownload({ magnet_url: 'magnet:' })).toBe(7);
    expect(retryDownload).toHaveBeenCalledWith(7, 'download.restarted');
    expect(snackbar.showAPIErrorSnackbar).not.toHaveBeenCalled();
  });

  it('keeps the dialog open when adding fails', async () => {
    vi.mocked(downloadService.create).mockRejectedValue(new Error('closed'));

    expect(await useDownloadCreate().createDownload({ magnet_url: 'magnet:' })).toBeNull();
    expect(snackbar.showAPIErrorSnackbar).toHaveBeenCalledOnce();
  });
});
