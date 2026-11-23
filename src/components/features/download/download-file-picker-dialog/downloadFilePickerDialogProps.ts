import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Download } from '@/interfaces/api/models/Download';
import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';

/** A torrent to pick files from, with the files still free to pick. */
export interface DownloadFilePickerSource {
  download: Download;
  /** Its files no episode waits for yet, in this show or another; each file is offered once. */
  availableFiles: DownloadFile[];
}

/** The files picked in the picker, all from one torrent. */
export interface PickedDownloadFiles {
  download: Download;
  files: DownloadFile[];
}

/** The torrent file picker's props; it closes with the picked files, or nothing when cancelled. */
export interface DownloadFilePickerDialogProps extends DialogComponentProps<PickedDownloadFiles> {
  /** The torrents to pick from, each with files left; with several, the picker switches between them. */
  sources: DownloadFilePickerSource[];
  /** What the files are for: the season or movie they become episodes of, or the one episode that takes a file. */
  targetName: string;
  /** Picks one file, for an episode, instead of files for new episodes. */
  isSingle?: boolean;
}

/** What a caller passes when it opens the picker; the dialog provider adds the rest. */
export type DownloadFilePickerInput = Omit<DownloadFilePickerDialogProps, 'modelValue' | 'close'>;
