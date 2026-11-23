import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';

/** The torrent file picker's props; it closes with the picked files, or nothing when cancelled. */
export interface DownloadFilePickerDialogProps extends DialogComponentProps<DownloadFile[]> {
  /** The files to pick from: the torrent's files no episode waits for yet. */
  files: DownloadFile[];
  /** What the files are for: the season or movie they become episodes of, or the one episode that takes a file. */
  targetName: string;
  /** Picks one file, for an episode, instead of files for new episodes. */
  isSingle?: boolean;
}
