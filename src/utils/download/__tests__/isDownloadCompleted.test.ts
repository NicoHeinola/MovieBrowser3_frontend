import { describe, expect, it } from 'vitest';

import { DownloadStatus } from '@/enums/download/DownloadStatus';

import { isDownloadCompleted } from '../isDownloadCompleted';

describe('isDownloadCompleted', () => {
  it('is true only for a completed download', () => {
    expect(isDownloadCompleted(DownloadStatus.Completed)).toBe(true);
    expect(isDownloadCompleted(DownloadStatus.Importing)).toBe(false);
    expect(isDownloadCompleted(DownloadStatus.Failed)).toBe(false);
  });
});
