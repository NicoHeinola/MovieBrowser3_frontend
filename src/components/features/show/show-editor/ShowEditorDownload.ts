import type { Download } from '@/interfaces/api/models/Download';
import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';

/** The torrent attached to the show editor, which its entries' and episodes' parts pick files from. */
export interface ShowEditorDownload {
  /** The torrent, or null when the editor has none. */
  download: Download | null;
  /** Its files no episode waits for yet, in this show or another; each file is offered once. */
  availableFiles: DownloadFile[];
}
