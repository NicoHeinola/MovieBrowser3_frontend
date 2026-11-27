import type { DownloadFile } from './DownloadFile';
import type { Show } from './Show';
import type { DownloadErrorCode } from '@/enums/download/DownloadErrorCode';
import type { DownloadStatus } from '@/enums/download/DownloadStatus';

/** A torrent handed to qBittorrent, with its progress as qBittorrent reports it now. */
export interface Download {
  id: number;
  /** The name it was added with, or qBittorrent's name for the torrent when it was added without one. */
  name: string;
  hash: string;
  status: DownloadStatus;
  /** Why it failed, or null. */
  error_code: DownloadErrorCode | null;
  /** When qBittorrent removed the torrent after it seeded, `null` while it has it. Its sizes are then gone too. */
  client_removed_at: string | null;
  /** 0 to 1, over the picked files. */
  progress: number;
  /** The size of the picked files. */
  size_bytes: number;
  downloaded_bytes: number;
  /** Bytes per second. */
  download_speed: number;
  /** Null while qBittorrent can't tell. */
  eta_seconds: number | null;
  /** The show its files were last picked for, with its titles only; null until picked. */
  show: Show | null;
  /** Every file of the torrent, empty until qBittorrent knows them; left out of the list of downloads. */
  files?: DownloadFile[];
  /** How many of its files are picked for episodes. */
  picked_file_count: number;
  /** How many of those are their episode's video by now. */
  imported_file_count: number;
  /** Episodes made for it that have no video and still wait for it. */
  waiting_episode_count: number;
  created_at: string;
}
