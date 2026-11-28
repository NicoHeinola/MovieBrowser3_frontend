import type { Download } from '@/interfaces/api/models/Download';

import { isDownloadActive } from '@/utils/download/isDownloadActive';
import { isDownloadCompleted } from '@/utils/download/isDownloadCompleted';

/**
 * Whether a download has progress worth a bar: it has a size, is done, or something happens to it right now.
 * @param download - The download.
 * @returns False for a torrent that waits for picks and has no size yet.
 */
export const hasDownloadProgress = (download: Pick<Download, 'status' | 'size_bytes'>): boolean =>
  download.size_bytes > 0 || isDownloadCompleted(download.status) || isDownloadActive(download.status);
