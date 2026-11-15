import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

/** Props of the dialog that confirms moving every video into a new folder. Closes with `true` to move. */
export interface VideoRelocationConfirmDialogProps extends DialogComponentProps<boolean> {
  /** The current video folder. */
  from: string;
  /** The new video folder. */
  to: string;
}
