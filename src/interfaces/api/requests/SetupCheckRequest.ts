import type { SettingKey } from '@/enums/setting/SettingKey';

/** The setup paths to check, keyed by the setting each is for. */
export interface SetupCheckRequest {
  [SettingKey.VideoBasePath]?: string;
  [SettingKey.VlcMediaPlayerPath]?: string;
}
