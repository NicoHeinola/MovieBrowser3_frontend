import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

/** Props of the "What's new" dialog. */
export interface ChangelogDialogProps extends DialogComponentProps {
  /** The updates the user has not seen yet, newest first. */
  entries: ChangelogEntry[];
}
