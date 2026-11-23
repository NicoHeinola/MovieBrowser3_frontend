import { describe, expect, it } from 'vitest';

import { DownloadStatus } from '@/enums/download/DownloadStatus';

import { getDownloadFileStatus } from '../getDownloadFileStatus';

describe('getDownloadFileStatus', () => {
  it('is completed once the file is its episode video, whatever the download does', () => {
    const file = { progress: 1, imported_at: '2026-11-23T12:00:00Z' };

    expect(getDownloadFileStatus({ status: DownloadStatus.Importing }, file)).toBe(DownloadStatus.Completed);
  });

  it('tells a downloaded file waiting for its copy from one still downloading', () => {
    const download = { status: DownloadStatus.Downloading };

    expect(getDownloadFileStatus(download, { progress: 1, imported_at: null })).toBe(DownloadStatus.Importing);
    expect(getDownloadFileStatus(download, { progress: 0.4, imported_at: null })).toBe(DownloadStatus.Downloading);
  });

  it('takes the download status while nothing moves', () => {
    const file = { progress: 0, imported_at: null };

    expect(getDownloadFileStatus({ status: DownloadStatus.Failed }, file)).toBe(DownloadStatus.Failed);
    expect(getDownloadFileStatus({ status: DownloadStatus.WaitingForFiles }, file)).toBe(
      DownloadStatus.WaitingForFiles,
    );
  });
});
