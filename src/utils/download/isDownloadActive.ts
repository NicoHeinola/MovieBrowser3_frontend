import { DownloadStatus } from '@/enums/download/DownloadStatus';

/** Statuses whose progress changes by itself: qBittorrent fetches the file list or downloads, or the app imports. */
const ACTIVE_STATUSES = new Set<DownloadStatus>([
  DownloadStatus.FetchingMetadata,
  DownloadStatus.Downloading,
  DownloadStatus.Importing,
]);

/**
 * Whether something happens to a download right now, so its progress is worth watching.
 * @param status - The download's status.
 * @returns True while it fetches its file list, downloads or imports.
 */
export const isDownloadActive = (status: DownloadStatus): boolean => ACTIVE_STATUSES.has(status);
