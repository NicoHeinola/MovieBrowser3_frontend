/** One database dump file in the backup folder. */
export interface Backup {
  /** The file name, such as `moviebrowser3-20261115-030000.dump`. */
  name: string;
  /** The file size in bytes. */
  size: number;
  created_at: string;
}
