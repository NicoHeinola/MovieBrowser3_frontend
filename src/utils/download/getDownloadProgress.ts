import type { Download } from '@/interfaces/api/models/Download';

import { i18n } from '@/plugins/i18n';
import { formatFileSize } from '@/utils/file/formatFileSize';

/** How far a download got, as its two readable parts. */
export interface DownloadProgress {
  /** Such as `25%`, rounded down so a download never reads 100% before it's done. */
  percent: string;
  /** Such as `1.0 GB of 4.0 GB`. */
  bytes: string;
}

/**
 * How far a download got, in the app's language.
 * @param download - The download.
 * @returns Its percent and bytes, or null before it has files to download.
 */
export const getDownloadProgress = (
  download: Pick<Download, 'progress' | 'downloaded_bytes' | 'size_bytes'>,
): DownloadProgress | null => {
  if (download.size_bytes <= 0) {
    return null;
  }

  const { locale, t } = i18n.global;

  return {
    percent: t('download.percent', { percent: Math.floor(download.progress * 100) }),
    bytes: t('download.bytesOf', {
      downloaded: formatFileSize(download.downloaded_bytes, locale.value),
      size: formatFileSize(download.size_bytes, locale.value),
    }),
  };
};
