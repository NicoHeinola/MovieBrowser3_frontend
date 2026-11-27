import { DownloadStatus } from '@/enums/download/DownloadStatus';

/**
 * Whether a download is complete: all its picked files are their episodes' videos.
 * @param status - The download's status.
 * @returns True once completed.
 */
export const isDownloadCompleted = (status: DownloadStatus): boolean => status === DownloadStatus.Completed;
