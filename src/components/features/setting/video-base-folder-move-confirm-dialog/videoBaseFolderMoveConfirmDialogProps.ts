import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

/** Props of the dialog that confirms moving every video into a new folder. Closes with `true` to move. */
export interface VideoBaseFolderMoveConfirmDialogProps extends DialogComponentProps<boolean> {
  /** The current video base folder. */
  from: string;
  /** The new video base folder. */
  to: string;
}
