/** A torrent search result the app can hand to qBittorrent, from any torrent site. */
export interface DownloadableTorrent {
  title: string;
  magnet_url: string;
  /** The `.torrent` link, when the site has one. */
  torrent_url: string | null;
  /** The site's page of the show, which fills a new show in. */
  media_url: string | null;
  size_bytes: number;
}
