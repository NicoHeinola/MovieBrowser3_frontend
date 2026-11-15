import type { SettingKey } from '@/enums/setting/SettingKey';

/** The value type of each setting the frontend reads or writes. */
export interface SettingValues {
  [SettingKey.VideoBasePath]: string;
  [SettingKey.VlcMediaPlayerPath]: string;
  [SettingKey.BannerDefaultVideos]: string[];
  [SettingKey.BannerDefaultBackgrounds]: string[];
}
