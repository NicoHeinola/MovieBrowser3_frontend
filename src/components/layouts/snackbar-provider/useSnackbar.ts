import type { SnackbarApi } from './SnackbarApi';
import { inject } from 'vue';

import { snackbarApiKey } from './snackbarApiKey';

export const useSnackbar = (): SnackbarApi => {
  const snackbar = inject(snackbarApiKey, null);

  if (snackbar === null) {
    throw new Error('useSnackbar must be used within SnackbarProvider.');
  }

  return snackbar;
};
