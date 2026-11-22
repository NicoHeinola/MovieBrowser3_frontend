import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';

/** The show template dialog's props; it closes with the loaded template, or nothing when cancelled. */
export interface ShowTemplateDialogProps extends DialogComponentProps<ShowTemplate> {
  /** The link to start with, such as the one the show was last filled in from. */
  initialUrl?: string;
}
