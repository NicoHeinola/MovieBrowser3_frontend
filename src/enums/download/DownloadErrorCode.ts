/** Why a download failed. Messages live under `download.errorCodes` in i18n. */
export enum DownloadErrorCode {
  /** qBittorrent no longer has the torrent, such as after someone removed it there. */
  ClientLostTorrent = 'client_lost_torrent',
  /** A finished file isn't in the download folder, such as after someone moved it. */
  FileMissing = 'file_missing',
  /** The video disk has too little room for a finished file. */
  NotEnoughDiskSpace = 'not_enough_disk_space',
  /** Copying a finished file into the video folder failed. */
  ImportFailed = 'import_failed',
}
