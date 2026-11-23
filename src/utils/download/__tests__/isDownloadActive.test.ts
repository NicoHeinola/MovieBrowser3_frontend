import { describe, expect, it } from 'vitest';

import { DownloadStatus } from '@/enums/download/DownloadStatus';

import { isDownloadActive } from '../isDownloadActive';

describe('isDownloadActive', () => {
  it('is true while the file list is fetched, the files download or they import', () => {
    expect(isDownloadActive(DownloadStatus.FetchingMetadata)).toBe(true);
    expect(isDownloadActive(DownloadStatus.Downloading)).toBe(true);
    expect(isDownloadActive(DownloadStatus.Importing)).toBe(true);
  });

  it('is false while waiting for picks, and once done or failed', () => {
    expect(isDownloadActive(DownloadStatus.WaitingForFiles)).toBe(false);
    expect(isDownloadActive(DownloadStatus.Completed)).toBe(false);
    expect(isDownloadActive(DownloadStatus.Failed)).toBe(false);
  });
});
