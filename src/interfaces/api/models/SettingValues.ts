import type { SettingKey } from '@/enums/setting/SettingKey';

/** The value type of each setting the frontend reads or writes. */
export interface SettingValues {
  [SettingKey.VideoBaseFolder]: string;
  [SettingKey.VlcMediaPlayerPath]: string;
  [SettingKey.BannerDefaultVideos]: string[];
  [SettingKey.BannerDefaultBackgrounds]: string[];
  [SettingKey.QBittorrentUrl]: string;
  [SettingKey.QBittorrentUsername]: string;
  /** Sent as a string; reads back as `null`, since a secret never leaves the backend. */
  [SettingKey.QBittorrentPassword]: string | null;
  [SettingKey.DownloadPath]: string;
}
