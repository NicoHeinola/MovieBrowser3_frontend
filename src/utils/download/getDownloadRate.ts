import type { Download } from '@/interfaces/api/models/Download';

import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { i18n } from '@/plugins/i18n';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { formatDuration } from '@/utils/time/formatDuration';

/** How fast a download goes, as its two readable parts. */
export interface DownloadRate {
  /** Such as `2.0 MB/s`. */
  speed: string;
  /** Such as `5:00`, or null while qBittorrent can't tell. */
  timeLeft: string | null;
}

/**
 * How fast a download goes and how long it still takes, in the app's language.
 * @param download - The download.
 * @returns Its speed and time left, or null while it doesn't download.
 */
export const getDownloadRate = (
  download: Pick<Download, 'status' | 'download_speed' | 'eta_seconds'>,
): DownloadRate | null => {
  if (download.status !== DownloadStatus.Downloading) {
    return null;
  }

  const { locale, t } = i18n.global;

  return {
    speed: t('download.perSecond', { size: formatFileSize(download.download_speed, locale.value) }),
    timeLeft: download.eta_seconds === null ? null : formatDuration(download.eta_seconds),
  };
};
