export interface SetupStatus {
  /** When an admin finished the first-login setup, or `null` while it is still due. */
  completed_at: string | null;
  /** Host folders the installer mounted for videos; empty in development. */
  media_folders: string[];
  /** The first common VLC location the backend found, or `null` when it found none. */
  detected_vlc_media_player_path: string | null;
}
