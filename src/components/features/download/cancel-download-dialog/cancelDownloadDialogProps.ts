import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Download } from '@/interfaces/api/models/Download';

/** The cancel dialog's props; it closes with true once the download is cancelled. */
export interface CancelDownloadDialogProps extends DialogComponentProps<boolean> {
  download: Download;
}
