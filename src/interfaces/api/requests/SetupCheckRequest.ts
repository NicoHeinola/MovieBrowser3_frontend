import type { SettingKey } from '@/enums/setting/SettingKey';

/** The setup values to check, keyed by the setting each is for. */
export interface SetupCheckRequest {
  [SettingKey.VideoBaseFolder]?: string;
  [SettingKey.VlcMediaPlayerPath]?: string;
  /** Sending the address checks the qBittorrent login with the username and password next to it. */
  [SettingKey.QBittorrentUrl]?: string;
  [SettingKey.QBittorrentUsername]?: string;
  /** Left out, the backend uses the saved password. */
  [SettingKey.QBittorrentPassword]?: string;
  [SettingKey.DownloadPath]?: string;
}
