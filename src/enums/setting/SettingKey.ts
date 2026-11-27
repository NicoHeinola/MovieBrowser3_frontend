/** The backend settings the frontend reads or writes. Value types live in `SettingValues`. */
export enum SettingKey {
  /** The folder videos are stored in and played from. Changes only through a video base folder move. */
  VideoBaseFolder = 'video_base_folder',
  /** VLC's full path, `vlc` to start it from the PATH, or empty when not set. */
  VlcMediaPlayerPath = 'vlc_media_player_path',
  /** YouTube URLs the home banner plays when no show has a video. */
  BannerDefaultVideos = 'banner_default_videos',
  /** Image URLs the home banner shows when no video plays. */
  BannerDefaultBackgrounds = 'banner_default_backgrounds',
  /** qBittorrent's Web UI address, such as `http://127.0.0.1:8080`. Empty while downloads are off. */
  QBittorrentUrl = 'qbittorrent_url',
  /** The username the app logs in to qBittorrent with. */
  QBittorrentUsername = 'qbittorrent_username',
  /** qBittorrent's password. A secret: it reads back as `null`, with `is_set` telling whether one is saved. */
  QBittorrentPassword = 'qbittorrent_password',
  /** The folder qBittorrent downloads into, as the app sees it (`/mnt/d/MovieBrowser3/Downloads`). */
  DownloadPath = 'download_path',
}
