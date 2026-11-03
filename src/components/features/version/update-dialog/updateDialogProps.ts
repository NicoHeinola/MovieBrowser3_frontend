import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { AvailableUpdate } from '@/utils/version/AvailableUpdate';

/** Props of the update dialog. */
export interface UpdateDialogProps extends DialogComponentProps {
  /** The update to describe. */
  update: AvailableUpdate;
}
