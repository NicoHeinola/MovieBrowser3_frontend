import type { Download } from '@/interfaces/api/models/Download';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { apiClient } from '@/plugins/api/apiClient';

import { downloadService } from '../downloadService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const download: Download = {
  id: 4,
  name: 'Show S01',
  hash: '12c03cf9cc60ea7c13931e0195fa54903d8af85f',
  status: DownloadStatus.WaitingForFiles,
  error_code: null,
  progress: 0,
  size_bytes: 0,
  downloaded_bytes: 0,
  download_speed: 0,
  eta_seconds: null,
  show: null,
  files: [],
  created_at: '2026-11-23T12:00:00Z',
};

describe('downloadService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('adds a torrent, waiting longer for qBittorrent to read it', async () => {
    const request = {
      magnet_url: 'magnet:?xt=urn:btih:abc',
      torrent_url: 'https://nekobt.to/1.torrent',
      name: 'Show S01',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: download });

    await expect(downloadService.create(request)).resolves.toEqual(download);
    expect(apiClient.post).toHaveBeenCalledWith('downloads', request, { timeout: 30_000 });
  });

  it('reads a download', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: download });

    await expect(downloadService.get(4)).resolves.toEqual(download);
    expect(apiClient.get).toHaveBeenCalledWith('downloads/4');
  });

  it('lists the downloads', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [download] });

    await expect(downloadService.list()).resolves.toEqual([download]);
    expect(apiClient.get).toHaveBeenCalledWith('downloads');
  });

  it('cancels a download, removing its waiting episodes only when asked', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

    await downloadService.remove(4, true);
    await downloadService.remove(5, false);

    expect(vi.mocked(apiClient.delete).mock.calls).toEqual([
      ['downloads/4', { params: { remove_episodes: 1 } }],
      ['downloads/5', { params: {} }],
    ]);
  });

  it('retries a download', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined });

    await downloadService.retry(4);

    expect(apiClient.post).toHaveBeenCalledWith('downloads/4/retry');
  });
});
