import type { SnackbarOptions } from './SnackbarOptions';
import type { SnackbarPresetOptions } from './SnackbarPresetOptions';

export interface SnackbarApi {
  showSnackbar: (options: SnackbarOptions) => void;
  showSuccessSnackbar: (message: string, overrides?: SnackbarPresetOptions) => void;
  showErrorSnackbar: (message: string, overrides?: SnackbarPresetOptions) => void;
  showWarningSnackbar: (message: string, overrides?: SnackbarPresetOptions) => void;
}
