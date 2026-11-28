import { describe, expect, it } from 'vitest';

import { DownloadStatus } from '@/enums/download/DownloadStatus';

import { hasDownloadProgress } from '../hasDownloadProgress';

describe('hasDownloadProgress', () => {
  it('is true once it has a size', () => {
    expect(hasDownloadProgress({ status: DownloadStatus.WaitingForFiles, size_bytes: 1024 })).toBe(true);
  });

  it('is true while active or once completed, even without a size', () => {
    expect(hasDownloadProgress({ status: DownloadStatus.FetchingMetadata, size_bytes: 0 })).toBe(true);
    expect(hasDownloadProgress({ status: DownloadStatus.Completed, size_bytes: 0 })).toBe(true);
  });

  it('is false while it waits for picks or failed without a size', () => {
    expect(hasDownloadProgress({ status: DownloadStatus.WaitingForFiles, size_bytes: 0 })).toBe(false);
    expect(hasDownloadProgress({ status: DownloadStatus.Failed, size_bytes: 0 })).toBe(false);
  });
});
