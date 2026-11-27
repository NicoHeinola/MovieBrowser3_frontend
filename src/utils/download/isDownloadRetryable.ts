import type { Download } from '@/interfaces/api/models/Download';

import { DownloadErrorCode } from '@/enums/download/DownloadErrorCode';
import { DownloadStatus } from '@/enums/download/DownloadStatus';

/** The fields of a download that tell whether it can be checked again. */
type RetryableDownload = Pick<Download, 'status' | 'error_code' | 'client_removed_at'>;

/** Statuses before any file is picked, with nothing to try again yet. */
const UNPICKED_STATUSES = new Set<DownloadStatus>([DownloadStatus.FetchingMetadata, DownloadStatus.WaitingForFiles]);

/**
 * Whether a download can be checked again: the backend finds which files are there, and missing files download and
 * import again.
 * @param download - The download.
 * @returns True while qBittorrent has the torrent and some files are picked.
 */
export const isDownloadRetryable = (download: RetryableDownload): boolean => {
  const isUnpicked = UNPICKED_STATUSES.has(download.status);
  const isLostByClient = download.error_code === DownloadErrorCode.ClientLostTorrent;
  // qBittorrent removes a torrent after it seeds
  const isRemovedByClient = download.client_removed_at !== null;

  return !isUnpicked && !isLostByClient && !isRemovedByClient;
};
