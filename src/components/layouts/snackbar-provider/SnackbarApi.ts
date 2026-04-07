import type { SnackbarDismissReason } from './SnackbarDismissReason';
import type { SnackbarOptions } from './SnackbarOptions';
import type { SnackbarPresetOptions } from './SnackbarPresetOptions';

export interface SnackbarApi {
  showSnackbar: (options: SnackbarOptions) => Promise<SnackbarDismissReason>;
  showSuccessSnackbar: (message: string, overrides?: SnackbarPresetOptions) => Promise<SnackbarDismissReason>;
  showErrorSnackbar: (message: string, overrides?: SnackbarPresetOptions) => Promise<SnackbarDismissReason>;
  showWarningSnackbar: (message: string, overrides?: SnackbarPresetOptions) => Promise<SnackbarDismissReason>;
}
