import { describe, expect, it } from 'vitest';

import { DownloadStatus } from '@/enums/download/DownloadStatus';

import { getDownloadRate } from '../getDownloadRate';

describe('getDownloadRate', () => {
  it('gives the speed and the time left while it downloads', () => {
    const download = { status: DownloadStatus.Downloading, download_speed: 2_097_152, eta_seconds: 300 };

    expect(getDownloadRate(download)).toEqual({ speed: '2.0 MB/s', timeLeft: '5:00' });
  });

  it('has no time left while qBittorrent cannot tell', () => {
    const download = { status: DownloadStatus.Downloading, download_speed: 0, eta_seconds: null };

    expect(getDownloadRate(download)?.timeLeft).toBeNull();
  });

  it('is null while it does not download', () => {
    const download = { status: DownloadStatus.Importing, download_speed: 2_097_152, eta_seconds: 300 };

    expect(getDownloadRate(download)).toBeNull();
  });
});
