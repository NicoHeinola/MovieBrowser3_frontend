import { describe, expect, it } from 'vitest';

import { getDownloadProgress } from '../getDownloadProgress';

describe('getDownloadProgress', () => {
  it('gives the percent, rounded down, and the bytes', () => {
    const download = { progress: 0.999, downloaded_bytes: 1_073_741_824, size_bytes: 4_294_967_296 };

    expect(getDownloadProgress(download)).toEqual({ percent: '99%', bytes: '1.0 GB of 4.0 GB' });
  });

  it('is null before there is anything to download', () => {
    expect(getDownloadProgress({ progress: 0, downloaded_bytes: 0, size_bytes: 0 })).toBeNull();
  });
});
