import { DownloadStatus } from '@/enums/download/DownloadStatus';

/** How each download status looks: its theme color and its MDI icon. Labels live under `download.statuses`. */
export const DOWNLOAD_STATUS_STYLES: Record<DownloadStatus, { color: string; icon: string }> = {
  [DownloadStatus.FetchingMetadata]: { color: 'info', icon: 'mdi-magnify' },
  [DownloadStatus.WaitingForFiles]: { color: 'info', icon: 'mdi-pause-circle-outline' },
  [DownloadStatus.Downloading]: { color: 'primary', icon: 'mdi-download' },
  [DownloadStatus.Importing]: { color: 'primary', icon: 'mdi-file-move-outline' },
  [DownloadStatus.Completed]: { color: 'success', icon: 'mdi-check-circle-outline' },
  [DownloadStatus.Failed]: { color: 'error', icon: 'mdi-alert-circle-outline' },
};
