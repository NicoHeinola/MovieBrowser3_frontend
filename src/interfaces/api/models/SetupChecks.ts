import type { SetupCheckResult } from './SetupCheckResult';
import type { SettingKey } from '@/enums/setting/SettingKey';

/** Results of the setup checks, keyed by the setting each value is for; only the values that were sent are checked. */
export interface SetupChecks {
  [SettingKey.VideoBasePath]?: SetupCheckResult;
  [SettingKey.VlcMediaPlayerPath]?: SetupCheckResult;
  /** The qBittorrent login, checked as a whole whenever its address is sent. */
  [SettingKey.QBittorrentUrl]?: SetupCheckResult;
  [SettingKey.DownloadPath]?: SetupCheckResult;
}
