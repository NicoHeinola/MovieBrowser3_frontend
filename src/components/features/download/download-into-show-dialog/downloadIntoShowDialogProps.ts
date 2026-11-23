import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { DownloadableTorrent } from '@/interfaces/download/DownloadableTorrent';

/** The props of the dialog that sends a torrent into a show; it opens that show's editor itself. */
export interface DownloadIntoShowDialogProps extends DialogComponentProps<void> {
  torrent: DownloadableTorrent;
}
