import type { SnackbarColor } from './SnackbarColor';
import type { SnackbarLocation } from './SnackbarLocation';

export interface QueuedSnackbar {
  closable: boolean;
  color: SnackbarColor;
  location: SnackbarLocation;
  text: string;
  timeout: number;
  variant: 'tonal';
}
