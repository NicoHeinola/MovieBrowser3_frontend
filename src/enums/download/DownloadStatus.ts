/** Where a download stands. Labels live under `download.statuses` in i18n. */
export enum DownloadStatus {
  /** qBittorrent is still fetching a magnet's file list from peers. */
  FetchingMetadata = 'fetching_metadata',
  /** Added to qBittorrent, stopped, until files are picked for episodes. */
  WaitingForFiles = 'waiting_for_files',
  Downloading = 'downloading',
  Importing = 'importing',
  Completed = 'completed',
  Failed = 'failed',
}
