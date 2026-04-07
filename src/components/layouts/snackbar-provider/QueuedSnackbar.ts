import type { SnackbarColor } from './SnackbarColor';
import type { SnackbarDismissReason } from './SnackbarDismissReason';
import type { SnackbarLocation } from './SnackbarLocation';

export interface QueuedSnackbar {
  closable: boolean;
  color: SnackbarColor;
  location: SnackbarLocation;
  onDismiss?: (reason: SnackbarDismissReason) => void;
  text: string;
  timeout: number;
  variant: 'tonal';
}
