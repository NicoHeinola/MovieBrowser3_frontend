/** Why a download failed. Messages live under `download.errorCodes` in i18n. */
export enum DownloadErrorCode {
  /** qBittorrent no longer has the torrent, such as after someone removed it there. */
  ClientLostTorrent = 'client_lost_torrent',
}
