import type { DownloadFilePickerSource } from '@/components/features/download/download-file-picker-dialog';

/** A torrent the show editor follows: one opened with the editor, added in it, or one the show's episodes wait for. */
export interface ShowEditorTorrent extends DownloadFilePickerSource {
  /**
   * Whether its files can still be picked. A completed torrent only reports where its episodes' files stand: qBittorrent
   * drops it once seeded, so nothing more downloads from it. `availableFiles` is empty unless it can.
   */
  canPick: boolean;
}

/** The torrents the show editor follows, which its entries' and episodes' parts read and pick files from. */
export interface ShowEditorDownloads {
  /** Every followed torrent, newest first. */
  torrents: ShowEditorTorrent[];
  /** The ones with files to pick right now: their file list is fetched, and some are left. */
  pickable: DownloadFilePickerSource[];
}
