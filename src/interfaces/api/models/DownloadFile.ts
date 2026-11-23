/** One file of a download's torrent. */
export interface DownloadFile {
  /** The file's index in the torrent, which picks refer to. */
  index: number;
  /** Its path inside the torrent, folders separated by `/`. */
  path: string;
  size_bytes: number;
  /** 0 to 1. */
  progress: number;
  /** The episode it's picked for, or null when it isn't downloaded. */
  episode_id: number | null;
  /** That episode's show: one torrent can feed several shows, and each leaves the others' picks alone. */
  show_id: number | null;
  /** When it became its episode's video; null until then. */
  imported_at: string | null;
}
