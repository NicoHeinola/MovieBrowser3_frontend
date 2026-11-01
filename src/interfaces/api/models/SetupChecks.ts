import type { SetupCheckResult } from './SetupCheckResult';

/** Results of the setup path checks; only the paths that were sent are checked. */
export interface SetupChecks {
  video_base_path?: SetupCheckResult;
  vlc_media_player_path?: SetupCheckResult;
}
