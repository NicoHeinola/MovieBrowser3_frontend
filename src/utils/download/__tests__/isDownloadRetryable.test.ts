import type { Download } from '@/interfaces/api/models/Download';
import { describe, expect, it } from 'vitest';

import { DownloadErrorCode } from '@/enums/download/DownloadErrorCode';
import { DownloadStatus } from '@/enums/download/DownloadStatus';

import { isDownloadRetryable } from '../isDownloadRetryable';

type RetryableFields = Pick<Download, 'status' | 'error_code' | 'client_removed_at'>;

/**
 * Builds the fields the check reads, for a download that qBittorrent has.
 * @param overrides - The fields that differ.
 * @returns The fields.
 */
const createDownload = (overrides: Partial<RetryableFields> = {}): RetryableFields => ({
  status: DownloadStatus.Downloading,
  error_code: null,
  client_removed_at: null,
  ...overrides,
});

describe('isDownloadRetryable', () => {
  it.each([DownloadStatus.Downloading, DownloadStatus.Importing, DownloadStatus.Completed, DownloadStatus.Failed])(
    'is true for a download %s that qBittorrent has',
    (status) => {
      expect(isDownloadRetryable(createDownload({ status }))).toBe(true);
    },
  );

  it('is false before files are picked', () => {
    expect(isDownloadRetryable(createDownload({ status: DownloadStatus.WaitingForFiles }))).toBe(false);
    expect(isDownloadRetryable(createDownload({ status: DownloadStatus.FetchingMetadata }))).toBe(false);
  });

  it('is false once qBittorrent lost the torrent', () => {
    const lost = createDownload({ status: DownloadStatus.Failed, error_code: DownloadErrorCode.ClientLostTorrent });

    expect(isDownloadRetryable(lost)).toBe(false);
  });

  it('is false once qBittorrent removed the torrent after it seeded', () => {
    const removed = createDownload({ status: DownloadStatus.Completed, client_removed_at: '2026-11-26T12:00:00Z' });

    expect(isDownloadRetryable(removed)).toBe(false);
  });
});
