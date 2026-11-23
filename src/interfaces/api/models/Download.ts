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
  /** Every file of the torrent; empty until qBittorrent knows them. */
  files: DownloadFile[];
  created_at: string;
}
