import type { Download } from '@/interfaces/api/models/Download';
import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';

import { DownloadStatus } from '@/enums/download/DownloadStatus';

/**
 * Where one picked file stands, which can differ from its download's status: while the torrent downloads, its files
 * finish one by one and are copied into their episodes as they do.
 * @param download - The file's download.
 * @param file - The file.
 * @returns Completed once it's its episode's video, importing once downloaded, downloading before that, and otherwise
 * the download's own status (waiting, failed).
 */
export const getDownloadFileStatus = (
  download: Pick<Download, 'status'>,
  file: Pick<DownloadFile, 'progress' | 'imported_at'>,
): DownloadStatus => {
  if (file.imported_at) {
    return DownloadStatus.Completed;
  }

  if (download.status !== DownloadStatus.Downloading && download.status !== DownloadStatus.Importing) {
    return download.status;
  }

  return file.progress >= 1 ? DownloadStatus.Importing : DownloadStatus.Downloading;
};
