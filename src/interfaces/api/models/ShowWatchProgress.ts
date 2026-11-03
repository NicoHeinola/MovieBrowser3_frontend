export interface ShowWatchProgress {
  show_id: number;
  show_entry_id: number;
  episode_id: number | null;
  position_seconds: number | null; // How far into the episode the user is, null until the player reports it
  duration_seconds: number | null; // The episode's length, null when unknown
  updated_at: string;
}
