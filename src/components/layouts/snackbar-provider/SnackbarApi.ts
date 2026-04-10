import type { SnackbarDismissReason } from './SnackbarDismissReason';
import type { SnackbarOptions } from './SnackbarOptions';

export interface SnackbarApi {
  showSnackbar: (options: SnackbarOptions) => Promise<SnackbarDismissReason>;
}
