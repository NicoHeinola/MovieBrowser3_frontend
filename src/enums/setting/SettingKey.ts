/** The backend settings the frontend reads or writes. Value types live in `SettingValues`. */
export enum SettingKey {
  /** The folder videos are stored in and played from. Changes only through a video relocation. */
  VideoBasePath = 'video_base_path',
  /** VLC's full path, `vlc` to start it from the PATH, or empty when not set. */
  VlcMediaPlayerPath = 'vlc_media_player_path',
  /** YouTube URLs the home banner plays when no show has a video. */
  BannerDefaultVideos = 'banner_default_videos',
  /** Image URLs the home banner shows when no video plays. */
  BannerDefaultBackgrounds = 'banner_default_backgrounds',
}
