/** A torrent to hand to qBittorrent. */
export interface CreateDownloadRequest {
  magnet_url: string;
  /** The `.torrent` link, when the site has one: qBittorrent reads its files at once. */
  torrent_url?: string | null;
  /** Shown in the app; left out, qBittorrent's name for the torrent is used. */
  name?: string | null;
}
