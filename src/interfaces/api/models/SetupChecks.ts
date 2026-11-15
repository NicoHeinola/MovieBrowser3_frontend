import type { SetupCheckResult } from './SetupCheckResult';
import type { SettingKey } from '@/enums/setting/SettingKey';

/** Results of the setup path checks, keyed by the setting each path is for; only the paths that were sent are checked. */
export interface SetupChecks {
  [SettingKey.VideoBasePath]?: SetupCheckResult;
  [SettingKey.VlcMediaPlayerPath]?: SetupCheckResult;
}
